/**
 * Highly optimized reactive computation hook for ActivityWatch metrics.
 * Consumes normalized data slices from the centralized Zustand store
 * and runs heavy analysis pipelines inside a memoized container.
 *
 * This module orchestrates the independent analysis domains:
 * Focus Analysis, Flow Detection, Burnout Prediction, and Timeline Aggregation.
 *
 * @module hooks/useAnalyticsComputation
 */

import { useMemo } from 'react';
import { useAppStore } from '@/store';
import { FocusAnalyzer } from '@/modules/focus/FocusAnalyzer';
import { FlowDetector } from '@/modules/flow/FlowDetector';
import { BurnoutPredictor } from '@/modules/burnout/BurnoutPredictor';
import { TimelineBuilder } from '@/modules/timeline/TimelineBuilder';
import type { FocusAnalysis, FlowAnalysis, BurnoutAnalysis, TimelineAnalysis } from '@/types';

/**
 * Unified analytics output shape encompassing all analysis engine data.
 */
export interface ComputedAnalytics {
  /** Granular session fragmentation and context-switch tracking data. */
  focusAnalysis: FocusAnalysis;
  /** Uninterrupted productive deep-work session detection patterns. */
  flowAnalysis: FlowAnalysis;
  /** Multi-factor structural exhaustion and boundary intrusion metrics. */
  burnoutAnalysis: BurnoutAnalysis;
  /** Gap-filled daily aggregates and calendar intensity matrices. */
  timelineAnalysis: TimelineAnalysis;
}

// Singletons instantiated outside the hook boundary to prevent garbage collection overhead during re-renders.
const focusAnalyzer = new FocusAnalyzer();
const flowDetector = new FlowDetector();
const burnoutPredictor = new BurnoutPredictor();
const timelineBuilder = new TimelineBuilder();

/**
 * Reactive computation hook that exposes calculated metrics to the frontend components.
 *
 * This implementation relies strictly on native dependency tracking to prevent
 * calculation memory voids during global UI updates (e.g., sidebar toggles or language shifts).
 *
 * @returns The complete analytics matrix if the dataset is loaded, or null otherwise.
 */
export function useAnalyticsComputation(): ComputedAnalytics | null {
  const status = useAppStore((s) => s.status);
  const windowEvents = useAppStore((s) => s.windowEvents);
  const dailySummaries = useAppStore((s) => s.dailySummaries);
  const processedAt = useAppStore((s) => s.processedAt);

  return useMemo(() => {
    // Guard clause: Avoid executing computationally heavy pipelines on uninitialized or empty datasets
    if (status !== 'loaded' || windowEvents.length === 0) {
      return null;
    }

    // Execute processing pipelines in sequence using optimized single-pass instances
    const focusAnalysis = focusAnalyzer.analyze(windowEvents);
    const flowAnalysis = flowDetector.analyze(windowEvents);
    const burnoutAnalysis = burnoutPredictor.analyze(dailySummaries);
    const timelineAnalysis = timelineBuilder.analyze(dailySummaries);

    return {
      focusAnalysis,
      flowAnalysis,
      burnoutAnalysis,
      timelineAnalysis,
    };
  }, [status, windowEvents, dailySummaries, processedAt]);
}
