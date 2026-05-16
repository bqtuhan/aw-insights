/**
 * BurnoutPredictor — multi‑factor burnout risk assessment based on daily
 * summaries of digital activity.
 *
 * ## Four‑factor weighted model
 *
 * | Factor              | Weight | Method Reference             |
 * |---------------------|--------|------------------------------|
 * | Late‑night work     | 35%    | `lateNightFactor`            |
 * | Weekly overload     | 30%    | `overloadFactor`             |
 * | Weekend intrusion   | 20%    | `weekendIntrusionFactor`     |
 * | Recovery deficit    | 15%    | `recoveryDeficitFactor`      |
 *
 * ## Trend detection
 *
 * The dataset is split in half (first 50 % vs. last 50 % by calendar days).
 * A composite sub‑score is computed for each half; if the score **decreases**
 * by ≥ 5 points the trend is “improving”, if it **increases** by ≥ 5 points
 * it is “worsening”, otherwise “stable”.
 *
 * ## Risk levels
 *
 * | Score range | Risk level |
 * |-------------|------------|
 * | 0–25        | low        |
 * | 26–50       | moderate   |
 * | 51–75       | high       |
 * | 76–100      | critical   |
 *
 * ## Anti‑regression & Gap Safety Layer
 *
 * This predictor incorporates a structural calibration pass (`fillCalendarGaps`)
 * before executing factors. Because ActivityWatch exports only contain logging on
 * days the user turned on their device, chronological calculations like 7-day
 * rolling windows and consecutive streaks would be artificially squeezed together.
 * By enjecting synthetic zero-duration entries for missing calendar dates, streak
 * disruptions and true resting boundaries are correctly evaluated.
 *
 * @module modules/burnout/BurnoutPredictor
 */

import type {
  DailySummary,
  BurnoutAnalysis,
  BurnoutFactorScores,
  BurnoutRiskLevel,
  BurnoutConfig,
  InsightModule,
} from '@/types';
import {
  lateNightFactor,
  overloadFactor,
  weekendIntrusionFactor,
  recoveryDeficitFactor,
} from './factors';
import { calculateBurnoutScore } from '@/lib/scoring';

// ────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────

/** Minimum score change required to flag a changing progression direction. */
const TREND_THRESHOLD = 5;

// ────────────────────────────────────────────────────
// BurnoutPredictor class
// ────────────────────────────────────────────────────

export class BurnoutPredictor
  implements InsightModule<DailySummary[], BurnoutAnalysis, BurnoutConfig>
{
  // ──────────────────────────────────────────────────
  // Public API
  // ──────────────────────────────────────────────────

  /**
   * Runs the full multi-factor burnout risk analysis.
   *
   * @param summaries - Daily summaries sorted by date ascending.
   * @param config - Optional overrides for analysis thresholds.
   * @returns A complete, production-ready `BurnoutAnalysis` payload.
   */
  analyze(
    summaries: DailySummary[],
    config?: Partial<BurnoutConfig>,
  ): BurnoutAnalysis {
    const cfg = { ...this.getDefaultConfig(), ...config };

    // Standardize timeline by structurally injecting zero-minute records for empty calendar gaps
    const standardizedTimeline = this.fillCalendarGaps(summaries);

    // 1. Compute each individual factor risk score (0–100).
    const factorScores = this.computeFactorScores(standardizedTimeline, cfg);

    // 2. Aggregate into a composite score using centralized formulas.
    const burnoutScore = calculateBurnoutScore(
      factorScores.lateNightScore,
      factorScores.overloadScore,
      factorScores.weekendIntrusionScore,
      factorScores.recoveryDeficitScore,
    );

    // 3. Evaluate qualitative severity boundaries.
    const riskLevel = this.classifyRiskLevel(burnoutScore);

    // 4. Determine path projection trend.
    const trend = this.computeTrend(standardizedTimeline, cfg);

    // 5. Build localized structural warning keys array.
    const warnings = this.generateWarnings(factorScores, riskLevel, trend);

    return {
      burnoutScore,
      riskLevel,
      factorScores,
      trend,
      warnings,
    };
  }

  /**
   * Returns the system default configuration parameters.
   */
  getDefaultConfig(): BurnoutConfig {
    return {
      lateNightHour: 22,
      overloadThresholdHours: 7,
      weekendThresholdMinutes: 30,
    };
  }

  // ──────────────────────────────────────────────────
  // Private helpers
  // ──────────────────────────────────────────────────

  /**
   * Computes the four standalone factor scores.
   */
  private computeFactorScores(
    summaries: DailySummary[],
    cfg: BurnoutConfig,
  ): BurnoutFactorScores {
    return {
      lateNightScore: lateNightFactor(summaries, cfg.lateNightHour),
      overloadScore: overloadFactor(summaries, cfg.overloadThresholdHours),
      weekendIntrusionScore: weekendIntrusionFactor(
        summaries,
        cfg.weekendThresholdMinutes,
      ),
      recoveryDeficitScore: recoveryDeficitFactor(
        summaries,
        cfg.overloadThresholdHours,
      ),
    };
  }

  /**
   * Calendar padding manager. Fills timeline gaps to preserve index coherence.
   * Converts intermittent usage records into a continuous daily matrix grid.
   */
  private fillCalendarGaps(summaries: DailySummary[]): DailySummary[] {
    if (summaries.length < 2) return summaries;
    const filled: DailySummary[] = [];

    for (let i = 0; i < summaries.length; i++) {
      const current = summaries[i]!;
      filled.push(current);

      if (i < summaries.length - 1) {
        const next = summaries[i + 1]!;
        const currDate = new Date(current.date);
        const nextDate = new Date(next.date);

        const diffMs = nextDate.getTime() - currDate.getTime();
        const diffDays = Math.floor(diffMs / 86400000);

        // Inject empty structural entries if dates are not contiguous
        for (let g = 1; g < diffDays; g++) {
          const gapDate = new Date(currDate.getTime() + g * 86400000);
          const dateStr = gapDate.toISOString().split('T')[0]!;
          const dayOfWeek = gapDate.getDay();
          
          const hourlyProductivity: Record<number, number> = {};
          for (let h = 0; h < 24; h++) {
            hourlyProductivity[h] = 0;
          }

          filled.push({
            date: dateStr,
            totalMinutes: 0,
            productiveMinutes: 0,
            firstEventAt: null,
            lastEventAt: null,
            hourlyProductivity,
            isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
          });
        }
      }
    }
    return filled;
  }

  /**
   * Translates score bounds to a string enum severity index token.
   */
  private classifyRiskLevel(score: number): BurnoutRiskLevel {
    if (score <= 25) return 'low';
    if (score <= 50) return 'moderate';
    if (score <= 75) return 'high';
    return 'critical';
  }

  /**
   * Evaluates progression velocity by splitting the stabilized timeline array.
   * Uses balanced sample segments instead of calendar intervals to offset density differences.
   */
  private computeTrend(
    summaries: DailySummary[],
    cfg: BurnoutConfig,
  ): 'improving' | 'stable' | 'worsening' {
    if (summaries.length < 6) return 'stable';

    const midpoint = Math.floor(summaries.length / 2);
    const firstHalf = summaries.slice(0, midpoint);
    const secondHalf = summaries.slice(midpoint);

    const firstScores = this.computeFactorScores(firstHalf, cfg);
    const firstComposite = calculateBurnoutScore(
      firstScores.lateNightScore,
      firstScores.overloadScore,
      firstScores.weekendIntrusionScore,
      firstScores.recoveryDeficitScore,
    );

    const secondScores = this.computeFactorScores(secondHalf, cfg);
    const secondComposite = calculateBurnoutScore(
      secondScores.lateNightScore,
      secondScores.overloadScore,
      secondScores.weekendIntrusionScore,
      secondScores.recoveryDeficitScore,
    );

    const delta = secondComposite - firstComposite;

    if (delta <= -TREND_THRESHOLD) return 'improving';
    if (delta >= TREND_THRESHOLD) return 'worsening';
    return 'stable';
  }

  /**
   * Evaluates profile thresholds and converts vectors into structural i18n mapping tokens.
   */
  private generateWarnings(
    scores: BurnoutFactorScores,
    riskLevel: BurnoutRiskLevel,
    trend: 'improving' | 'stable' | 'worsening',
  ): string[] {
    const warnings: string[] = [];

    // Late-night alerts evaluating severe vs moderate layers
    if (scores.lateNightScore >= 50) {
      warnings.push(
        scores.lateNightScore >= 75
          ? 'burnout.warnings.lateNightSevere'
          : 'burnout.warnings.lateNightModerate',
      );
    }

    // Work overload capacity triggers
    if (scores.overloadScore >= 50) {
      warnings.push(
        scores.overloadScore >= 75
          ? 'burnout.warnings.overloadSevere'
          : 'burnout.warnings.overloadModerate',
      );
    }

    // Boundary infiltration thresholds
    if (scores.weekendIntrusionScore >= 50) {
      warnings.push(
        scores.weekendIntrusionScore >= 75
          ? 'burnout.warnings.weekendSevere'
          : 'burnout.warnings.weekendModerate',
      );
    }

    // Consecutive load patterns without recovery markers
    if (scores.recoveryDeficitScore >= 50) {
      warnings.push(
        scores.recoveryDeficitScore >= 75
          ? 'burnout.warnings.recoverySevere'
          : 'burnout.warnings.recoveryModerate',
      );
    }

    // Contextual composite risk classification
    if (riskLevel === 'critical') {
      warnings.push('burnout.warnings.criticalRisk');
    } else if (riskLevel === 'high') {
      warnings.push('burnout.warnings.highRisk');
    }

    // Velocity trend signals
    if (trend === 'worsening' && riskLevel !== 'low') {
      warnings.push('burnout.warnings.trendWorsening');
    } else if (trend === 'improving' && riskLevel !== 'low') {
      warnings.push('burnout.warnings.trendImproving');
    }

    // Default return payload for optimal profiles
    if (warnings.length === 0) {
      warnings.push('burnout.warnings.healthyPatterns');
    }

    return warnings;
  }
}
