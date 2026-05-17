/**
 * FocusAnalyzer — produces a comprehensive `FocusAnalysis` from normalized
 * window events.
 *
 * ## Metrics computed
 * - **Sessions**: grouped via `buildSessions()` with configurable gap threshold.
 * - **Total switches**: count of application changes between consecutive events.
 * - **Fragility score**: switches‑per‑hour normalised to 0‑100 (lower = better).
 * - **Hourly fragility**: average switches per hour (0‑23) across all days.
 * - **Weekday pattern**: average switches per day of week (0=Sun … 6=Sat).
 * - **Overall score**: weighted composite via `calculateFocusScore()`.
 *
 * ## Config
 * All thresholds are exposed via `FocusConfig` so users can tune them in the UI.
 *
 * @module modules/focus/FocusAnalyzer
 */

import type {
  NormalizedWindowEvent,
  FocusAnalysis,
  FocusSession,
  FocusConfig,
  InsightModule,
} from '@/types';
import { buildSessions } from './sessionBuilder';
import { calculateFocusScore } from '@/lib/scoring';
import { roundToDecimals, toDateString } from '@/lib/utils';

// ────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────

/**
 * Maximum context switches per hour used to normalise fragility.
 * Values at or above this cap → fragility score of 100.
 */
const MAX_SWITCHES_PER_HOUR = 30;

// ────────────────────────────────────────────────────
// FocusAnalyzer class
// ────────────────────────────────────────────────────

export class FocusAnalyzer
  implements InsightModule<NormalizedWindowEvent[], FocusAnalysis, FocusConfig>
{
  // ──────────────────────────────────────────────────
  // Public API
  // ──────────────────────────────────────────────────

  /**
   * Runs the full focus analysis.
   *
   * @param events - Chronologically sorted normalized window events.
   * @param config - Optional overrides for session‑building thresholds.
   * @returns A complete `FocusAnalysis` object.
   */
  analyze(
    events: NormalizedWindowEvent[],
    config?: Partial<FocusConfig>,
  ): FocusAnalysis {
    const cfg = { ...this.getDefaultConfig(), ...config };

    // 1. Build focus sessions.
    const sessions = buildSessions(
      events,
      cfg.sessionGapThresholdSeconds,
      cfg.deepFocusMinMinutes,
    );

    // 2. Compute switch metrics.
    const totalSwitches = this.countSwitches(events);
    const totalTrackedHours = this.totalTrackedHours(events);
    const switchesPerHour =
      totalTrackedHours > 0 ? totalSwitches / totalTrackedHours : 0;

    // 3. Fragility score (0‑100; higher = more fragmented).
    const fragilityScore = roundToDecimals(
      (Math.min(switchesPerHour, MAX_SWITCHES_PER_HOUR) /
        MAX_SWITCHES_PER_HOUR) *
        100,
      0,
    );

    // 4. Hourly fragility map.
    const hourlyFragility = this.buildHourlyFragility(events);

    // 5. Weekday pattern.
    const weekdayPattern = this.buildWeekdayPattern(events);

    // 6. Session statistics.
    const sessionCount = sessions.length;
    const averageSessionDurationMinutes =
      sessionCount > 0
        ? roundToDecimals(
            sessions.reduce((s, sess) => s + sess.durationMinutes, 0) /
              sessionCount,
            1,
          )
        : 0;
    const deepFocusSessionCount = sessions.filter((s) => s.isDeepFocus).length;

    // 7. Overall focus score (weighted composite).
    const deepFocusRatio =
      sessionCount > 0 ? deepFocusSessionCount / sessionCount : 0;
    const overallScore = calculateFocusScore(
      switchesPerHour,
      averageSessionDurationMinutes,
      deepFocusRatio,
    );

    return {
      sessionCount,
      averageSessionDurationMinutes,
      deepFocusSessionCount,
      totalSwitches,
      fragilityScore,
      hourlyFragility,
      weekdayPattern,
      overallScore,
      sessions,
    };
  }

  /**
   * Returns the default `FocusConfig`.
   */
  getDefaultConfig(): FocusConfig {
    return {
      sessionGapThresholdSeconds: 120,
      deepFocusMinMinutes: 25,
      fragmentedThresholdMinutes: 5,
    };
  }

  // ──────────────────────────────────────────────────
  // Private helpers
  // ──────────────────────────────────────────────────

  /**
   * Counts the number of times the application changes between consecutive
   * events. Two events with the same `normalizedApp` are not counted.
   */
  private countSwitches(events: NormalizedWindowEvent[]): number {
    if (events.length < 2) return 0;

    let switches = 0;
    for (let i = 1; i < events.length; i++) {
      if (events[i]!.normalizedApp !== events[i - 1]!.normalizedApp) {
        switches++;
      }
    }
    return switches;
  }

  /**
   * Returns the total number of tracked hours across the dataset.
   * Computed as the sum of all event durations (not the calendar span).
   * This gives a more accurate representation of actual active tracking time.
   */
  private totalTrackedHours(events: NormalizedWindowEvent[]): number {
    if (events.length === 0) return 0;
    const totalMs = events.reduce((sum, e) => sum + e.durationMs, 0);
    return totalMs / 3600000;
  }

  /**
   * Builds a per‑hour fragility map (keys 0‑23).
   *
   * For each hour across all days we count the total switches that occurred
   * during that hour and divide by the number of distinct days that have any
   * event in that hour. The result is the **average switches per hour**
   * for that hour slot across the dataset.
   */
  private buildHourlyFragility(
    events: NormalizedWindowEvent[],
  ): Record<number, number> {
    const hourlySwitches: Record<number, number> = {};
    const hourlyDays: Record<number, Set<string>> = {};

    for (let h = 0; h < 24; h++) {
      hourlySwitches[h] = 0;
      hourlyDays[h] = new Set();
    }

    if (events.length < 2) {
      // With 0 or 1 events there are no switches to count.
      const result: Record<number, number> = {};
      for (let h = 0; h < 24; h++) {
        result[h] = 0;
      }
      return result;
    }

    for (let i = 1; i < events.length; i++) {
      const prev = events[i - 1]!;
      const curr = events[i]!;

      if (curr.normalizedApp !== prev.normalizedApp) {
        // The switch "belongs" to the hour of the event that triggered it.
        const hour = curr.startTime.getHours();
        const dateStr = toDateString(curr.startTime);

        hourlySwitches[hour] = (hourlySwitches[hour] ?? 0) + 1;
        hourlyDays[hour]!.add(dateStr);
      }
    }

    const result: Record<number, number> = {};
    for (let h = 0; h < 24; h++) {
      const dayCount = hourlyDays[h]?.size ?? 0;
      result[h] =
        dayCount > 0
          ? roundToDecimals((hourlySwitches[h] ?? 0) / dayCount, 1)
          : 0;
    }

    return result;
  }

  /**
   * Builds a weekday pattern map (0=Sun … 6=Sat).
   *
   * For each weekday we compute the **average number of switches** across
   * all instances of that day in the dataset.
   */
  private buildWeekdayPattern(
    events: NormalizedWindowEvent[],
  ): Record<number, number> {
    const daySwitches: Record<number, number> = {};
    const dayCounts: Record<number, number> = {};

    for (let d = 0; d < 7; d++) {
      daySwitches[d] = 0;
      dayCounts[d] = 0;
    }

    if (events.length === 0) {
      return { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    }

    // Group events by date, then count switches within each day.
    const eventsByDate = new Map<string, NormalizedWindowEvent[]>();
    for (const ev of events) {
      const dateStr = toDateString(ev.startTime);
      const group = eventsByDate.get(dateStr);
      if (group) {
        group.push(ev);
      } else {
        eventsByDate.set(dateStr, [ev]);
      }
    }

    for (const [, dayEvents] of eventsByDate) {
      const weekday = dayEvents[0]!.startTime.getDay(); // 0=Sun
      const switchesInDay = this.countSwitches(dayEvents);

      daySwitches[weekday] = (daySwitches[weekday] ?? 0) + switchesInDay;
      dayCounts[weekday] = (dayCounts[weekday] ?? 0) + 1;
    }

    const result: Record<number, number> = {};
    for (let d = 0; d < 7; d++) {
      result[d] =
        (dayCounts[d] ?? 0) > 0
          ? roundToDecimals((daySwitches[d] ?? 0) / (dayCounts[d] ?? 1), 1)
          : 0;
    }

    return result;
  }
}