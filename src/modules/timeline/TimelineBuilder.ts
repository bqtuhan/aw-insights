/**
 * TimelineBuilder — assembles the complete `TimelineAnalysis` from daily
 * summaries, including calendar heatmap data.
 *
 * ## Output
 * - `dailyAggregates` — the original (or gap‑filled) daily summaries.
 * - `heatmapData` — the intensity grid built from those summaries.
 *
 * @module modules/timeline/TimelineBuilder
 */

import type { DailySummary, TimelineAnalysis } from '@/types';
import { buildHeatmap } from './heatmapBuilder';
import { toDateString, parseDateString, daysBetween } from '@/lib/utils';

/**
 * Fills calendar gaps between the first and last dates in the dataset with
 * zero‑activity records so that timeline visualisations and streak‑based
 * calculations are accurate.
 *
 * @param summaries - Sorted daily summaries (ascending).
 * @returns A new array with missing days injected.
 */
function fillCalendarGaps(summaries: DailySummary[]): DailySummary[] {
  if (summaries.length === 0) return [];

  // Clone and sort for safety.
  const sorted = [...summaries].sort((a, b) => a.date.localeCompare(b.date));

  const firstDate = sorted[0]!.date;
  const lastDate = sorted[sorted.length - 1]!.date;
  if (!firstDate || !lastDate) return sorted;

  const totalDays = daysBetween(firstDate, lastDate);
  if (totalDays <= sorted.length) return sorted; // No gaps (or very few)

  // Build a lookup map from date string to existing summary.
  const existingMap = new Map<string, DailySummary>();
  for (const s of sorted) {
    existingMap.set(s.date, s);
  }

  const filled: DailySummary[] = [];
  const startDate = parseDateString(firstDate);

  for (let i = 0; i < totalDays; i++) {
    const current = new Date(startDate);
    current.setDate(startDate.getDate() + i);
    const dateStr = toDateString(current);

    const existing = existingMap.get(dateStr);
    if (existing) {
      filled.push(existing);
    } else {
      filled.push({
        date: dateStr,
        totalMinutes: 0,
        productiveMinutes: 0,
        firstEventAt: null,
        lastEventAt: null,
        hourlyProductivity: Object.fromEntries(
          Array.from({ length: 24 }, (_, h) => [h, 0]),
        ) as Record<number, number>,
        isWeekend: current.getDay() === 0 || current.getDay() === 6,
      });
    }
  }

  return filled;
}

/**
 * The main TimelineBuilder class.
 *
 * Although not strictly required to implement `InsightModule` (which targets
 * configurable modules), it follows the same `analyze` / `getDefaultConfig`
 * pattern for consistency.
 */
export class TimelineBuilder {
  /**
   * Builds the complete timeline analysis from daily summaries.
   *
   * @param summaries - Daily summaries (can be unsorted, possibly with gaps).
   * @returns A `TimelineAnalysis` object.
   */
  analyze(summaries: DailySummary[]): TimelineAnalysis {
    const sorted = [...summaries].sort((a, b) => a.date.localeCompare(b.date));
    const filledSummaries = fillCalendarGaps(sorted);
    const heatmapData = buildHeatmap(filledSummaries);

    return {
      dailyAggregates: filledSummaries,
      heatmapData,
    };
  }

  /**
   * Returns a minimal configuration object (no tunable parameters yet).
   */
  getDefaultConfig(): Record<string, never> {
    return {};
  }
}