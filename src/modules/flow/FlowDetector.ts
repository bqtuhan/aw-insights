/**
 * FlowDetector — identifies flow‑state sessions from normalized window events
 * using the Csikszentmihalyi‑inspired model of uninterrupted productive work.
 *
 * ## Algorithm (avoids the double‑counting overlap bug)
 *
 * 1. **Pre‑filter** events to those whose `category` is in the configured
 *    `productiveCategories` list.  Non‑productive events serve only as
 *    interruption markers.
 * 2. **Temporal scan**: walk the sorted events.  When the gap between the end
 *    of the previous event and the start of the current event is **less than
 *    `maxInterruptionSeconds`**, the events belong to the same flow block.
 *    A gap ≥ the threshold, or a non‑productive event, breaks the block.
 * 3. **Duration check**: a block whose total duration ≥ `minDurationMinutes`
 *    is promoted to a `FlowSession`.
 * 4. **Intensity**: computed per‑session via `weightedFlowIntensity()`.
 * 5. **Peak hours**: top‑3 hours of the day (0‑23) by total flow minutes.
 *
 * Because the detector works on **one event stream at a time**, it never
 * double‑counts overlapping desktop + web events.  The caller is responsible
 * for passing *deduplicated* or *single‑source* window events (see
 * `AWParser`).
 *
 * ## Config
 * All thresholds are exposed via `FlowConfig`.
 *
 * @module modules/flow/FlowDetector
 */

import type {
  NormalizedWindowEvent,
  FlowAnalysis,
  FlowSession,
  FlowConfig,
  InsightModule,
} from '@/types';
import { weightedFlowIntensity } from './flowScorer';
import { calculateFlowScore } from '@/lib/scoring';
import { roundToDecimals } from '@/lib/utils';

// ────────────────────────────────────────────────────
// FlowDetector class
// ────────────────────────────────────────────────────

export class FlowDetector
  implements InsightModule<NormalizedWindowEvent[], FlowAnalysis, FlowConfig>
{
  // ──────────────────────────────────────────────────
  // Public API
  // ──────────────────────────────────────────────────

  /**
   * Runs the full flow analysis.
   *
   * @param events - Chronologically sorted normalized window events (single source).
   * @param config - Optional overrides for detection thresholds.
   * @returns A complete `FlowAnalysis` object.
   */
  analyze(
    events: NormalizedWindowEvent[],
    config?: Partial<FlowConfig>,
  ): FlowAnalysis {
    const cfg = { ...this.getDefaultConfig(), ...config };
    const productiveSet = new Set(cfg.productiveCategories);

    // Patch: Lock onto primary OS window events to eliminate browser/editor layer double-counting
    const primaryEvents = events.filter((e) => e.bucketType === 'currentwindow');
    const timelineSource = primaryEvents.length > 0 ? primaryEvents : events;

    // 1. Detect flow sessions.
    const sessions = this.detectFlowSessions(timelineSource, productiveSet, cfg);

    // 2. Aggregate metrics.
    const totalFlowMinutes = roundToDecimals(
      sessions.reduce((sum, s) => sum + s.durationMinutes, 0),
      1,
    );
    const flowSessionCount = sessions.length;
    const averageFlowDurationMinutes =
      flowSessionCount > 0
        ? roundToDecimals(totalFlowMinutes / flowSessionCount, 1)
        : 0;

    // 3. Total productive minutes (for ratio calculation).
    const totalProductiveMinutes = roundToDecimals(
      timelineSource
        .filter((e) => productiveSet.has(e.category))
        .reduce((sum, e) => sum + e.durationMs / 60000, 0),
      1,
    );

    // 4. Flow ratio (0–1).
    const flowRatio =
      totalProductiveMinutes > 0
        ? roundToDecimals(totalFlowMinutes / totalProductiveMinutes, 3)
        : 0;

    // 5. Peak hours.
    const peakHours = this.computePeakHours(sessions);

    // 6. Overall intensity score.
    const intensityScore = calculateFlowScore(
      totalFlowMinutes,
      totalProductiveMinutes,
    );

    return {
      totalFlowMinutes,
      flowSessionCount,
      averageFlowDurationMinutes,
      flowRatio,
      peakHours,
      intensityScore,
      sessions,
    };
  }

  /**
   * Returns the default `FlowConfig`.
   */
  getDefaultConfig(): FlowConfig {
    return {
      minDurationMinutes: 25,
      maxInterruptionSeconds: 180,
      productiveCategories: [
        'Development',
        'Design',
        'Productivity',
      ],
    };
  }

  // ──────────────────────────────────────────────────
  // Private helpers
  // ──────────────────────────────────────────────────

  /**
   * Detects flow sessions by scanning the event stream for continuous
   * productive blocks.
   *
   * **Temporal footprint**: uses actual event durations, never calendar‑span
   * subtraction, so nights and weekends do not dilute the metrics.
   *
   * @param events - Sorted normalized window events.
   * @param productiveSet - Set of categories considered productive.
   * @param cfg - Detection configuration.
   * @returns Array of detected flow sessions.
   */
  private detectFlowSessions(
    events: NormalizedWindowEvent[],
    productiveSet: Set<string>,
    cfg: FlowConfig,
  ): FlowSession[] {
    if (events.length === 0) return [];

    const sessions: FlowSession[] = [];
    let blockStart: Date | null = null;
    let blockEnd: Date | null = null;
    let blockDurationMs = 0;
    let blockCategory: string | null = null;

    const finalizeBlock = () => {
      if (
        blockStart !== null &&
        blockEnd !== null &&
        blockCategory !== null
      ) {
        const durationMinutes = blockDurationMs / 60000;
        if (durationMinutes >= cfg.minDurationMinutes) {
          const category = blockCategory as import('@/types').AppCategory;
          sessions.push({
            category,
            startTime: blockStart,
            endTime: blockEnd,
            durationMinutes: roundToDecimals(durationMinutes, 1),
            intensity: roundToDecimals(
              weightedFlowIntensity(durationMinutes, category),
              3,
            ),
          });
        }
      }

      // Reset block state.
      blockStart = null;
      blockEnd = null;
      blockDurationMs = 0;
      blockCategory = null;
    };

    for (let i = 0; i < events.length; i++) {
      const event = events[i]!;
      const isProductive = productiveSet.has(event.category);
      const previousEvent = i > 0 ? events[i - 1] : null;

      if (!isProductive) {
        // Non‑productive event always breaks the current block.
        finalizeBlock();
        continue;
      }

      // ── Productive event ──────────────────────────

      if (blockStart === null) {
        // Start a new block.
        blockStart = event.startTime;
        blockEnd = event.endTime;
        blockDurationMs = event.durationMs;
        blockCategory = event.category;
        continue;
      }

      // Check gap from the previous event (regardless of its category).
      if (previousEvent) {
        const gapMs =
          event.startTime.getTime() - previousEvent.endTime.getTime();
        const gapSeconds = gapMs / 1000;

        // Math.max safeguards against overlapping negative boundaries from multi-platform data
        if (Math.max(0, gapSeconds) > cfg.maxInterruptionSeconds) {
          // Gap too large → finalise current block and start a new one.
          finalizeBlock();
          blockStart = event.startTime;
          blockEnd = event.endTime;
          blockDurationMs = event.durationMs;
          blockCategory = event.category;
          continue;
        }
      }

      // Extend current block.
      blockEnd = event.endTime;
      blockDurationMs += event.durationMs;
    }

    // Don't forget the last block.
    finalizeBlock();

    return sessions;
  }

  /**
   * Computes the top‑3 hours of the day (0‑23) by total flow minutes,
   * sorted descending.
   */
  private computePeakHours(
    sessions: FlowSession[],
  ): { hour: number; minutes: number }[] {
    const hourMap = new Map<number, number>();

    for (const session of sessions) {
      // Distribute flow minutes proportionally across the hours the session
      // spans.  For short sessions we assign all minutes to the start hour.
      const startHour = session.startTime.getHours();
      const endHour = session.endTime.getHours();

      if (startHour === endHour || session.durationMinutes < 5) {
        hourMap.set(
          startHour,
          (hourMap.get(startHour) ?? 0) + session.durationMinutes,
        );
      } else {
        // Simple proportional split across spanned hours.
        const totalSpanMs =
          session.endTime.getTime() - session.startTime.getTime();
        if (totalSpanMs <= 0) {
          hourMap.set(
            startHour,
            (hourMap.get(startHour) ?? 0) + session.durationMinutes,
          );
          continue;
        }

        let cursor = session.startTime.getTime();
        while (cursor < session.endTime.getTime()) {
          const currentHour = new Date(cursor).getHours();
          const nextHourBoundary =
            new Date(cursor).setHours(currentHour + 1, 0, 0, 0);
          const segmentEnd = Math.min(
            nextHourBoundary,
            session.endTime.getTime(),
          );
          const segmentMs = segmentEnd - cursor;
          const segmentMinutes =
            (segmentMs / totalSpanMs) * session.durationMinutes;

          hourMap.set(
            currentHour,
            (hourMap.get(currentHour) ?? 0) + segmentMinutes,
          );
          cursor = segmentEnd;
        }
      }
    }

    // Sort hours by total flow minutes descending, take top 3.
    const sorted = Array.from(hourMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour, minutes]) => ({
        hour,
        minutes: roundToDecimals(minutes, 1),
      }));

    return sorted;
  }
}
