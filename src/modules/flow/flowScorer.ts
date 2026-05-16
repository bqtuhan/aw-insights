/**
 * Pure helper functions for computing flow intensity from session duration
 * and category weights.  All functions are side‑effect‑free and take
 * explicit numeric inputs.
 *
 * ## Intensity model
 *
 * Intensity follows a **sigmoid (logistic) curve** so that short sessions
 * contribute very little while sessions beyond ~30 min rapidly approach the
 * maximum.  The curve is parameterised so that:
 *
 * -  5 min → intensity ≈ 0.05
 * - 25 min → intensity ≈ 0.50  (inflection point)
 * - 60 min → intensity ≈ 0.95
 * - 90+ min → intensity → 1.00
 *
 * Each `AppCategory` carries a weight multiplier so that, for example,
 * Development and Design are “heavier” flow inducers than Browsing.
 *
 * @module modules/flow/flowScorer
 */

import type { AppCategory } from '@/types';
import { clamp } from '@/lib/utils';

// ────────────────────────────────────────────────────
// Sigmoid parameters
// ────────────────────────────────────────────────────

/**
 * Steepness factor `k` in the logistic function.
 * Higher values produce a sharper transition around the midpoint.
 */
const SIGMOID_K = 0.12;

/**
 * Midpoint `t0` (minutes) — the duration at which intensity = 0.5.
 * Default: 25 min (matches the deep‑focus threshold).
 */
const SIGMOID_MIDPOINT = 25;

// ────────────────────────────────────────────────────
// Category weights
// ────────────────────────────────────────────────────

/**
 * Per‑category weight multiplier for flow intensity.
 *
 * Development and Design are considered the strongest flow‑inducing
 * categories.  Browsing and Communication contribute less, and
 * Entertainment / System / Other are effectively excluded.
 *
 * Weights are normalised so that the heaviest category = 1.0.
 */
const CATEGORY_WEIGHTS: Record<AppCategory, number> = {
  Development: 1.0,
  Design: 1.0,
  Productivity: 0.85,
  Browsing: 0.5,
  Communication: 0.5,
  Entertainment: 0.2,
  System: 0.1,
  Other: 0.1,
};

// ────────────────────────────────────────────────────
// Public API
// ────────────────────────────────────────────────────

/**
 * Computes the raw flow intensity (0–1) for a given session duration using
 * a sigmoid (logistic) curve.
 *
 * @param durationMinutes - Uninterrupted productive session length in minutes.
 * @returns Intensity value between 0 and 1.
 *
 * @example
 * flowIntensity(5)   // ≈ 0.05
 * flowIntensity(25)  // ≈ 0.50
 * flowIntensity(60)  // ≈ 0.98
 * flowIntensity(120) // ≈ 1.00
 */
export function flowIntensity(durationMinutes: number): number {
  if (durationMinutes <= 0) return 0;

  // Logistic function: 1 / (1 + exp(-k * (t - t0)))
  const exponent = -SIGMOID_K * (durationMinutes - SIGMOID_MIDPOINT);
  const raw = 1 / (1 + Math.exp(exponent));

  // Clamp to [0, 1] for safety.
  return clamp(raw, 0, 1);
}

/**
 * Computes category‑weighted flow intensity (0–1).
 *
 * Multiplies the sigmoid‑based raw intensity by the per‑category weight.
 * A 25‑min Development session thus yields ~0.50, while a 25‑min
 * Entertainment session yields only ~0.10.
 *
 * @param durationMinutes - Uninterrupted session length in minutes.
 * @param category - The `AppCategory` of the session.
 * @returns Weighted intensity between 0 and 1.
 */
export function weightedFlowIntensity(
  durationMinutes: number,
  category: AppCategory,
): number {
  const raw = flowIntensity(durationMinutes);
  const weight = CATEGORY_WEIGHTS[category] ?? 0.1;
  return clamp(raw * weight, 0, 1);
}

/**
 * Returns the category weight for a given `AppCategory`.
 *
 * @param category - The application category.
 * @returns Weight value (0–1).
 */
export function getCategoryWeight(category: AppCategory): number {
  return CATEGORY_WEIGHTS[category] ?? 0.1;
}

/**
 * Computes the flow intensity using a logarithmic duration curve (alternative
 * model).  Useful when you prefer a model with diminishing returns rather
 * than a sigmoid inflection.
 *
 * Formula: `intensity = min(1, log2(durationMinutes + 1) / log2(121))`
 *
 * -  5 min → 0.40
 * - 25 min → 0.66
 * - 60 min → 0.83
 * - 120 min → 1.00
 *
 * @param durationMinutes - Session duration in minutes.
 * @returns Intensity value between 0 and 1.
 */
export function flowIntensityLog(durationMinutes: number): number {
  if (durationMinutes <= 0) return 0;
  const numerator = Math.log2(durationMinutes + 1);
  const denominator = Math.log2(121); // log2(120 + 1)
  return clamp(numerator / denominator, 0, 1);
}