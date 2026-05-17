/**
 * AWParser — master parser that ingests a raw ActivityWatch JSON export string
 * and produces fully normalized, cross‑platform event arrays plus daily summaries.
 *
 * ## Pipeline
 * 1. Parse the JSON string (expects either `{ buckets: {…} }` or direct `{ bucket_id: {…} }`).
 * 2. For every bucket call `normalizeBatch()` which selects the correct per‑platform
 *    normalizer based on `bucket.type`.
 * 3. Merge all window events into one chronological array.
 * 4. Build `DailySummary[]` by aggregating productive time per calendar day.
 *
 * @module modules/parser/AWParser
 */

import type {
  AWEvent,
  AWBucket,
  NormalizedWindowEvent,
  NormalizedAFKEvent,
  DailySummary,
  AppCategory,
} from '@/types';
import { normalizeBatch } from './eventNormalizers';
import { isWeekend, toDateString } from '@/lib/utils';

// ────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────

/**
 * Categories considered "productive" for daily‑summary aggregation.
 * Matches the default `productiveCategories` used by the FlowDetector.
 */
const PRODUCTIVE_CATEGORIES: ReadonlySet<AppCategory> = new Set([
  'Development',
  'Design',
  'Productivity',
  'Communication',
]);

// ────────────────────────────────────────────────────
// Parse result
// ────────────────────────────────────────────────────

/** Output of a successful parse. */
export interface ParseResult {
  /** All normalized window events, sorted chronologically. */
  windowEvents: NormalizedWindowEvent[];
  /** All normalized AFK events, sorted chronologically. */
  afkEvents: NormalizedAFKEvent[];
  /** Daily summaries built from window events. */
  dailySummaries: DailySummary[];
}

// ────────────────────────────────────────────────────
// AWParser class
// ────────────────────────────────────────────────────

export class AWParser {
  /**
   * Parses a raw ActivityWatch JSON export and returns structured results.
   *
   * The input can be in either of two common formats:
   * - `{ "bucket_id": { … }, … }` (direct bucket map)
   * - `{ "buckets": { "bucket_id": { … }, … } }` (nested under "buckets")
   *
   * @param rawJson - The complete export JSON as a UTF‑8 string.
   * @returns A `ParseResult` with normalized events and daily summaries.
   * @throws If the JSON is syntactically invalid.
   */
  parse(rawJson: string): ParseResult {
    const parsed: unknown = JSON.parse(rawJson);

    // Normalize the top‑level structure into a flat bucket map.
    const bucketMap = this.extractBucketMap(parsed);

    const allWindowEvents: NormalizedWindowEvent[] = [];
    const allAfkEvents: NormalizedAFKEvent[] = [];

    for (const [bucketId, rawBucket] of Object.entries(bucketMap)) {
      // Skip anything that doesn't look like a valid bucket.
      if (!rawBucket || typeof rawBucket !== 'object') continue;
      if (!Array.isArray((rawBucket as Record<string, unknown>).events)) continue;

      const bucket = rawBucket as AWBucket;
      const { windowEvents, afkEvents } = normalizeBatch(
        bucket.events as AWEvent[],
        bucket.type ?? 'unknown',
      );

      allWindowEvents.push(...windowEvents);
      allAfkEvents.push(...afkEvents);
    }

    // Sort chronologically — downstream modules expect sorted data.
    allWindowEvents.sort(
      (a, b) => a.startTime.getTime() - b.startTime.getTime(),
    );
    allAfkEvents.sort(
      (a, b) => a.startTime.getTime() - b.startTime.getTime(),
    );

    // Deduplicate overlapping events from different buckets (e.g. desktop + browser)
    const deduplicatedWindowEvents = this.deduplicateEvents(allWindowEvents);

    const dailySummaries = this.buildDailySummaries(deduplicatedWindowEvents);

    return {
      windowEvents: deduplicatedWindowEvents,
      afkEvents: allAfkEvents,
      dailySummaries,
    };
  }

  // ──────────────────────────────────────────────────
  // Private helpers
  // ──────────────────────────────────────────────────

  /**
   * Deduplicates overlapping events by prioritizing higher-fidelity buckets.
   * If two events overlap, we keep the one from a more specific bucket or the longer one.
   */
  private deduplicateEvents(events: NormalizedWindowEvent[]): NormalizedWindowEvent[] {
    if (events.length < 2) return events;

    const result: NormalizedWindowEvent[] = [];
    let current = events[0]!;

    for (let i = 1; i < events.length; i++) {
      const next = events[i]!;

      // Check for overlap
      if (next.startTime.getTime() < current.endTime.getTime()) {
        // Overlap detected. Decide which one to keep or how to trim.
        // For simplicity in this intelligence tool, we prioritize the one that ends later
        // or has a "higher" bucket type priority if we had one.
        if (next.endTime.getTime() > current.endTime.getTime()) {
          // If next starts after current but ends later, we could trim current
          // but for now let's just ensure we don't double count the duration in summaries.
          // The buildDailySummaries will still sum durations.
          // A better way is to ensure non-overlapping intervals.
          
          // Keep current, but adjust next to start where current ends to avoid double counting
          const adjustedNext = {
            ...next,
            startTime: new Date(current.endTime.getTime()),
            durationMs: Math.max(0, next.endTime.getTime() - current.endTime.getTime())
          };
          
          if (adjustedNext.durationMs > 0) {
            result.push(current);
            current = adjustedNext;
          }
        } else {
          // Next is entirely within current, skip next
          continue;
        }
      } else {
        // No overlap
        result.push(current);
        current = next;
      }
    }
    result.push(current);
    return result;
  }

  /**
   * Normalises the top‑level JSON into `Record<string, unknown>`.
   *
   * Handles:
   * - `{ "buckets": { … } }`  → returns the inner object
   * - `{ "bucket_id": { … } }` → returns the object as‑is
   * - anything else             → returns the object as‑is (graceful fallback)
   */
  private extractBucketMap(
    parsed: unknown,
  ): Record<string, unknown> {
    if (parsed && typeof parsed === 'object') {
      const obj = parsed as Record<string, unknown>;
      // Check for nested "buckets" key.
      if (
        'buckets' in obj &&
        obj.buckets &&
        typeof obj.buckets === 'object'
      ) {
        return obj.buckets as Record<string, unknown>;
      }
      return obj;
    }
    return {};
  }

  /**
   * Aggregates normalized window events into `DailySummary` objects.
   *
   * Each summary contains:
   * - Total and productive minutes for that day.
   * - Hour‑by‑hour productive distribution (keys 0‑23).
   * - First / last event timestamps.
   * - Whether the day is a weekend.
   */
  private buildDailySummaries(
    events: NormalizedWindowEvent[],
  ): DailySummary[] {
    if (events.length === 0) return [];

    // Group events by calendar date (local time).
    const dayMap = new Map<string, NormalizedWindowEvent[]>();

    for (const ev of events) {
      const dateStr = toDateString(ev.startTime);
      const bucket = dayMap.get(dateStr);
      if (bucket) {
        bucket.push(ev);
      } else {
        dayMap.set(dateStr, [ev]);
      }
    }

    const summaries: DailySummary[] = [];

    for (const [date, dayEvents] of dayMap) {
      const totalMinutes = dayEvents.reduce(
        (sum, e) => sum + e.durationMs / 60000,
        0,
      );

      let productiveMinutes = 0;
      const hourlyProductivity: Record<number, number> = {};

      // Initialise hour buckets.
      for (let h = 0; h < 24; h++) {
        hourlyProductivity[h] = 0;
      }

      for (const ev of dayEvents) {
        const minutes = ev.durationMs / 60000;
        if (PRODUCTIVE_CATEGORIES.has(ev.category)) {
          productiveMinutes += minutes;
          const hour = ev.startTime.getHours();
          hourlyProductivity[hour] = (hourlyProductivity[hour] ?? 0) + minutes;
        }
      }

      const firstEvent = dayEvents[0]!;
      const lastEvent = dayEvents[dayEvents.length - 1]!;

      summaries.push({
        date,
        totalMinutes: Math.round(totalMinutes * 10) / 10,
        productiveMinutes: Math.round(productiveMinutes * 10) / 10,
        firstEventAt: firstEvent.startTime,
        lastEventAt: lastEvent.endTime,
        hourlyProductivity,
        isWeekend: isWeekend(firstEvent.startTime),
      });
    }

    // Sort by date ascending.
    summaries.sort((a, b) => a.date.localeCompare(b.date));

    return summaries;
  }
}
