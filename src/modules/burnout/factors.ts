/**
 * Pure scoring functions for the four burnout risk factors.
 *
 * Each factor takes a `DailySummary[]` (already built by the parser) and
 * returns a 0–100 score where **higher = greater burnout risk**.
 *
 * ## Factor weights (from the BurnoutPredictor spec)
 *
 * | Factor              | Weight | Description                                   |
 * |---------------------|--------|-----------------------------------------------|
 * | Late‑night work     | 35%    | After‑hours activity (22:00–06:00).           |
 * | Weekly overload     | 30%    | 7‑day rolling average vs. threshold.          |
 * | Weekend intrusion   | 20%    | Work bleeding into Saturday / Sunday.         |
 * | Recovery deficit    | 15%    | Consecutive high‑load days without a break.   |
 *
 * ## Anti‑regression guard
 *
 * All functions operate on **pre‑aggregated `DailySummary` boundaries**,
 * never on blind calendar‑span subtractions, so timeline gaps (nights,
 * weekends with no data) do not artificially dilute the metrics.
 *
 * @module modules/burnout/factors
 */

import type { DailySummary } from '@/types';
import { clamp, roundToDecimals } from '@/lib/utils';

// ────────────────────────────────────────────────────
// Constants — tunable thresholds
// ────────────────────────────────────────────────────

/** Hour defining the start of “late night” (inclusive).  Default: 22 (10 PM). */
const LATE_NIGHT_START_HOUR = 22;

/** Hour defining the end of the late‑night window (exclusive).  Default: 6 (6 AM). */
const LATE_NIGHT_END_HOUR = 6;

/** Daily productive hours threshold for overload detection.  Default: 7 h. */
const OVERLOAD_THRESHOLD_HOURS = 7;

/** Minimum productive minutes on a weekend day to count as intrusion.  Default: 30. */
const WEEKEND_THRESHOLD_MINUTES = 30;

/** Rolling window size (days) for weekly overload calculation. */
const ROLLING_WINDOW_DAYS = 7;

/** Look‑back window for recovery deficit (days). */
const RECOVERY_WINDOW_DAYS = 14;

/** Maximum excess hours for normalising overload (3 h excess = 100). */
const MAX_EXCESS_HOURS = 3;

// ────────────────────────────────────────────────────
// Factor 1 — Late‑night work (35 %)
// ────────────────────────────────────────────────────

/**
 * Scores late‑night work risk.
 *
 * For each **active day** (a day with any productive minutes), we compute
 * the fraction of productive minutes that fell between `LATE_NIGHT_START_HOUR`
 * and `LATE_NIGHT_END_HOUR` (wrapping across midnight).  The final score is
 * the **average of those per‑day fractions** × 100.
 *
 * Days with zero total productive time are excluded from the average so that
 * tracking gaps do not artificially lower the score.
 *
 * @param summaries - Daily summaries sorted by date ascending.
 * @param lateNightHour - Optional override for the late‑night start hour.
 * @returns Score 0–100.  Higher = more late‑night work.
 */
export function lateNightFactor(
  summaries: DailySummary[],
  lateNightHour: number = LATE_NIGHT_START_HOUR,
): number {
  if (summaries.length === 0) return 0;

  const endHour = LATE_NIGHT_END_HOUR;
  let activeDayCount = 0;
  let totalFraction = 0;

  for (const day of summaries) {
    if (day.totalMinutes <= 0) continue;
    activeDayCount++;

    // Productive minutes in late‑night hours.
    let lateNightMinutes = 0;

    for (let h = 0; h < 24; h++) {
      const isLateNight =
        lateNightHour <= endHour
          ? h >= lateNightHour && h < endHour // e.g. 22–6 in a single block
          : h >= lateNightHour || h < endHour; // wraps midnight
      if (isLateNight) {
        lateNightMinutes += day.hourlyProductivity[h] ?? 0;
      }
    }

    const dayProductiveMinutes = day.productiveMinutes;
    if (dayProductiveMinutes > 0) {
      totalFraction += lateNightMinutes / dayProductiveMinutes;
    }
  }

  if (activeDayCount === 0) return 0;

  return clamp(
    roundToDecimals((totalFraction / activeDayCount) * 100, 0),
    0,
    100,
  );
}

// ────────────────────────────────────────────────────
// Factor 2 — Weekly overload (30 %)
// ────────────────────────────────────────────────────

/**
 * Scores weekly overload risk using a 7‑day rolling average.
 *
 * For each possible 7‑day window the average daily productive hours is
 * computed.  If the average exceeds `overloadThresholdHours`, the excess
 * is mapped linearly to 0–100 where `MAX_EXCESS_HOURS` hours of excess = 100.
 *
 * The **maximum** excess across all windows is returned as the factor score.
 * This ensures short bursts of intense work are captured even if the overall
 * average looks fine.
 *
 * @param summaries - Daily summaries sorted by date ascending.
 * @param thresholdHours - Daily hours threshold (default 7).
 * @returns Score 0–100.  Higher = more overload.
 */
export function overloadFactor(
  summaries: DailySummary[],
  thresholdHours: number = OVERLOAD_THRESHOLD_HOURS,
): number {
  if (summaries.length < ROLLING_WINDOW_DAYS) return 0;

  let maxExcess = 0;

  // Slide a 7‑day window over the dataset.
  for (let start = 0; start <= summaries.length - ROLLING_WINDOW_DAYS; start++) {
    const windowSlice = summaries.slice(start, start + ROLLING_WINDOW_DAYS);
    
    // Compute average productive hours in this window based on full 7-day boundary
    const totalProductiveHours =
      windowSlice.reduce((sum, d) => sum + d.productiveMinutes, 0) / 60;
    const avgHours = totalProductiveHours / ROLLING_WINDOW_DAYS;

    if (avgHours > thresholdHours) {
      const excess = avgHours - thresholdHours;
      const normalisedExcess = (excess / MAX_EXCESS_HOURS) * 100;
      maxExcess = Math.max(maxExcess, normalisedExcess);
    }
  }

  return clamp(roundToDecimals(maxExcess, 0), 0, 100);
}

// ────────────────────────────────────────────────────
// Factor 3 — Weekend intrusion (20 %)
// ────────────────────────────────────────────────────

/**
 * Scores weekend‑intrusion risk.
 *
 * Computes the percentage of weekend days (Saturday / Sunday) in the dataset
 * that have **more than `weekendThresholdMinutes`** of productive activity.
 *
 * Only days that actually appear in the dataset are counted — missing days
 * (tracking gaps) are excluded so they don't dilute the metric.
 *
 * @param summaries - Daily summaries sorted by date ascending.
 * @param thresholdMinutes - Minimum minutes to consider a weekend day “intruded”.
 * @returns Score 0–100.  Higher = more weekend work.
 */
export function weekendIntrusionFactor(
  summaries: DailySummary[],
  thresholdMinutes: number = WEEKEND_THRESHOLD_MINUTES,
): number {
  const weekendDays = summaries.filter((d) => d.isWeekend);

  if (weekendDays.length === 0) return 0;

  const intrudedDays = weekendDays.filter(
    (d) => d.productiveMinutes > thresholdMinutes,
  );

  return clamp(
    roundToDecimals((intrudedDays.length / weekendDays.length) * 100, 0),
    0,
    100,
  );
}

// ────────────────────────────────────────────────────
// Factor 4 — Recovery deficit (15 %)
// ────────────────────────────────────────────────────

/**
 * Scores recovery‑deficit risk based on the last `RECOVERY_WINDOW_DAYS` days.
 *
 * **Step 1** — Identify “high‑load” days (productive hours ≥ overload threshold).
 *
 * **Step 2** — Count what percentage of the look‑back window consists of
 * high‑load days.
 *
 * **Step 3** — Apply a **consecutive streak multiplier**: if the most recent
 * days are all high‑load, the score is amplified.  The multiplier grows
 * exponentially with streak length:
 *
 * - 0‑1 day streak:  ×1.0
 * - 2 days:          ×1.15
 * - 3 days:          ×1.30
 * - 4 days:          ×1.50
 * - 5+ days:         ×1.70
 *
 * @param summaries - Daily summaries sorted by date ascending.
 * @param thresholdHours - Hours threshold defining a “high‑load” day.
 * @returns Score 0–100.  Higher = worse recovery.
 */
export function recoveryDeficitFactor(
  summaries: DailySummary[],
  thresholdHours: number = OVERLOAD_THRESHOLD_HOURS,
): number {
  if (summaries.length === 0) return 0;

  // Take the most recent N days.
  const recentWindow = summaries.slice(-RECOVERY_WINDOW_DAYS);
  const totalDays = recentWindow.length;

  // Count high‑load days.
  let highLoadCount = 0;
  for (const day of recentWindow) {
    const productiveHours = day.productiveMinutes / 60;
    if (productiveHours >= thresholdHours) {
      highLoadCount++;
    }
  }

  if (highLoadCount === 0) return 0;

  // Base score: percentage of high‑load days in the window.
  const baseScore = (highLoadCount / totalDays) * 100;

  // Consecutive streak from the most recent day backward.
  let streak = 0;
  for (let i = recentWindow.length - 1; i >= 0; i--) {
    const day = recentWindow[i]!;
    const productiveHours = day.productiveMinutes / 60;
    if (productiveHours >= thresholdHours) {
      streak++;
    } else {
      break;
    }
  }

  // Streak multiplier.
  const streakMultiplier =
    streak >= 5
      ? 1.7
      : streak === 4
        ? 1.5
        : streak === 3
          ? 1.3
          : streak === 2
            ? 1.15
            : 1.0;

  return clamp(roundToDecimals(baseScore * streakMultiplier, 0), 0, 100);
}
