/**
 * Pure heatmap builder — transforms `DailySummary[]` into a calendar‑ready
 * array of `HeatmapEntry` objects with 5 intensity levels.
 *
 * ## Level boundaries (static quantiles)
 * | Level | Total productive minutes |
 * |-------|--------------------------|
 * | 0     | 0                        |
 * | 1     | 1 – 59                   |
 * | 2     | 60 – 179                 |
 * | 3     | 180 – 359                |
 * | 4     | ≥ 360 (6+ hours)         |
 *
 * @module modules/timeline/heatmapBuilder
 */

import type { DailySummary, HeatmapEntry } from '@/types';

/**
 * Converts daily summaries into heatmap data.
 *
 * @param summaries - Array of `DailySummary` objects (any order; result is sorted by date).
 * @returns Sorted array of `HeatmapEntry` objects.
 */
export function buildHeatmap(summaries: DailySummary[]): HeatmapEntry[] {
  if (summaries.length === 0) return [];

  const entries: HeatmapEntry[] = summaries.map((day) => {
    const minutes = Math.round(day.productiveMinutes);
    let level: number;

    if (minutes <= 0) {
      level = 0;
    } else if (minutes < 60) {
      level = 1;
    } else if (minutes < 180) {
      level = 2;
    } else if (minutes < 360) {
      level = 3;
    } else {
      level = 4;
    }

    return {
      date: day.date,
      value: minutes,
      level,
    };
  });

  // Sort chronologically.
  entries.sort((a, b) => a.date.localeCompare(b.date));

  return entries;
}