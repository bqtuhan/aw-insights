/**
 * Pure scoring functions — the mathematical engine of aw-insights.
 * Each function takes numeric inputs and returns a 0–100 score.
 * All formulas are documented so thresholds can be tuned without touching UI code.
 *
 * @module lib/scoring
 */

import { clamp } from './utils';

// ────────────────────────────────────────────────────
// Thresholds & constants (centralised for tuning)
// ────────────────────────────────────────────────────

/** Maximum context switches per hour to normalise fragility. Higher values are rarer. */
const MAX_SWITCHES_PER_HOUR = 30;

/** Weight distribution for focus score. */
const FOCUS_WEIGHTS = {
  switchRate: 0.4,
  sessionDepth: 0.35,
  deepFocusFrequency: 0.25,
} as const;

/** Weight distribution for burnout composite. */
const BURNOUT_WEIGHTS = {
  lateNight: 0.35,
  overload: 0.3,
  weekendIntrusion: 0.2,
  recoveryDeficit: 0.15,
} as const;

// ────────────────────────────────────────────────────
// Individual score helpers
// ────────────────────────────────────────────────────

/**
 * Converts switches-per-hour into a focus‑friendly score (0–100).
 * Fewer switches → higher score.
 *
 * @param switchesPerHour - Average context switches per hour.
 * @returns Score where 100 = minimal switching, 0 = extreme fragmentation.
 */
function switchRateScore(switchesPerHour: number): number {
  const capped = Math.min(switchesPerHour, MAX_SWITCHES_PER_HOUR);
  const ratio = capped / MAX_SWITCHES_PER_HOUR; // 0…1, 1 = worst
  return clamp((1 - ratio) * 100, 0, 100);
}

/**
 * Session depth score derived from the average session length (in minutes).
 * Using a logarithmic scale to reward longer sessions but with diminishing returns.
 * 0 min → 0, 25 min → 60, 50 min → 85, 120 min → 100.
 *
 * @param avgSessionMinutes - Average focus session duration.
 * @returns 0–100 score.
 */
function sessionDepthScore(avgSessionMinutes: number): number {
  if (avgSessionMinutes <= 0) return 0;
  // Log‑base‑2: moderate growth
  const score = 20 * Math.log2(avgSessionMinutes + 1);
  return clamp(score, 0, 100);
}

/**
 * Deep focus frequency score from the ratio of sessions that are deep.
 *
 * @param deepFocusRatio - Fraction of sessions that are deep (0–1).
 * @returns 0–100 score.
 */
function deepFocusFrequencyScore(deepFocusRatio: number): number {
  return clamp(deepFocusRatio * 100, 0, 100);
}

// ────────────────────────────────────────────────────
// Public scoring functions
// ────────────────────────────────────────────────────

/**
 * Computes the overall focus score using weighted components.
 *
 * Weights (from FocusAnalyzer spec):
 * - Switch rate (40%): derived from switchesPerHour, lower is better.
 * - Session depth (35%): derived from average session duration.
 * - Deep focus frequency (25%): fraction of sessions that qualify as deep.
 *
 * @param switchesPerHour - Average context switches per hour.
 * @param avgSessionMinutes - Average focus session duration in minutes.
 * @param deepFocusRatio - Ratio of deep‑focus sessions (0–1).
 * @returns Overall focus score (0–100), higher is better.
 */
export function calculateFocusScore(
  switchesPerHour: number,
  avgSessionMinutes: number,
  deepFocusRatio: number,
): number {
  const switchScore = switchRateScore(switchesPerHour);
  const depthScore = sessionDepthScore(avgSessionMinutes);
  const deepScore = deepFocusFrequencyScore(deepFocusRatio);

  const weighted =
    FOCUS_WEIGHTS.switchRate * switchScore +
    FOCUS_WEIGHTS.sessionDepth * depthScore +
    FOCUS_WEIGHTS.deepFocusFrequency * deepScore;

  return clamp(Math.round(weighted), 0, 100);
}

/**
 * Computes the flow intensity score.
 *
 * Flow score is primarily driven by the ratio of flow minutes to total productive
 * minutes. A small bonus is added for the absolute amount of flow minutes to
 * distinguish between two users with identical ratios but different volumes.
 *
 * @param flowMinutes - Total minutes spent in flow state.
 * @param totalProductiveMinutes - Total productive minutes tracked.
 * @returns Flow score (0–100), higher is better.
 */
export function calculateFlowScore(
  flowMinutes: number,
  totalProductiveMinutes: number,
): number {
  if (totalProductiveMinutes <= 0) return 0;

  // Base ratio score (0–100)
  const ratio = flowMinutes / totalProductiveMinutes;
  const ratioScore = ratio * 100;

  // Volume bonus (up to 10 points extra for large absolute flow amounts)
  const volumeBonus = Math.min(10, (flowMinutes / 600) * 10); // 600 min (10h) = max bonus

  return clamp(Math.round(ratioScore + volumeBonus), 0, 100);
}

/**
 * Computes the composite burnout risk score using the four clinically‑inspired factors.
 *
 * Weight distribution (from BurnoutPredictor):
 * - Late-night work: 35%
 * - Weekly overload: 30%
 * - Weekend intrusion: 20%
 * - Recovery deficit: 15%
 *
 * Each factor is expected to already be normalised 0–100 (higher = more risk).
 *
 * @param lateNightFactor - Late‑night work risk score (0–100).
 * @param overloadFactor - Weekly overload risk score (0–100).
 * @param weekendFactor - Weekend intrusion risk score (0–100).
 * @param recoveryDeficitFactor - Recovery deficit risk score (0–100).
 * @returns Composite burnout score (0–100), higher = greater risk.
 */
export function calculateBurnoutScore(
  lateNightFactor: number,
  overloadFactor: number,
  weekendFactor: number,
  recoveryDeficitFactor: number,
): number {
  const weighted =
    BURNOUT_WEIGHTS.lateNight * lateNightFactor +
    BURNOUT_WEIGHTS.overload * overloadFactor +
    BURNOUT_WEIGHTS.weekendIntrusion * weekendFactor +
    BURNOUT_WEIGHTS.recoveryDeficit * recoveryDeficitFactor;

  return clamp(Math.round(weighted), 0, 100);
}