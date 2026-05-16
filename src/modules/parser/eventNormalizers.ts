/**
 * Event normalizer functions — pure transformation functions that take raw
 * ActivityWatch events from any platform and produce clean, typed
 * `NormalizedWindowEvent` or `NormalizedAFKEvent` instances.
 *
 * Every function in this file:
 * - Is **pure** (no side effects, no DOM, no I/O).
 * - Returns a **new** object (never mutates the input).
 * - Handles missing / malformed data gracefully (never throws).
 *
 * ## Platform coverage
 * | Function                  | Bucket type            | Platform  |
 * |---------------------------|------------------------|-----------|
 * | `normalizeWindowEvent`    | `currentwindow`        | Desktop   |
 * | `normalizeAFKEvent`       | `afkstatus`            | Desktop   |
 * | `normalizeWebTabEvent`    | `web.tab.current`      | Web       |
 * | `normalizeEditorEvent`    | `app.editor.activity`  | Editor    |
 * | `normalizeAndroidEvent`   | `currentwindow`        | Android   |
 * | `normalizeUnlockEvent`    | `os.lockscreen.unlocks`| Android   |
 *
 * @module modules/parser/eventNormalizers
 */

import type {
  AWEvent,
  AWCurrentWindowData,
  AWAFKEventData,
  AWWebTabData,
  AWEditorActivityData,
  NormalizedWindowEvent,
  NormalizedAFKEvent,
  NormalizedUnlockEvent,
  AppCategory,
} from '@/types';
import { mapCategory } from '@/modules/categories/CategoryMapper';

// ────────────────────────────────────────────────────
// Internal helpers
// ────────────────────────────────────────────────────

/**
 * Converts an ISO 8601 timestamp string to a Date object.
 * Returns `null` on parse failure instead of throwing.
 */
function safeDate(iso: string): Date | null {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Creates the base fields shared by every normalized event.
 */
function baseFields(raw: AWEvent) {
  const startTime = safeDate(raw.timestamp);
  const durationMs = (raw.duration ?? 0) * 1000;
  const endTime = startTime ? new Date(startTime.getTime() + durationMs) : new Date();

  return {
    rawTimestamp: raw.timestamp,
    durationMs,
    startTime: startTime ?? new Date(),
    endTime,
  };
}

// ────────────────────────────────────────────────────
// Platform‑specific normalizers
// ────────────────────────────────────────────────────

/**
 * Normalizes a **desktop** window event (`currentwindow` bucket from
 * aw-watcher-window).
 *
 * Data shape: `{ app: string, title: string }`
 *
 * @param event - Raw AWEvent with `currentwindow` payload.
 * @returns A fully populated `NormalizedWindowEvent`.
 */
export function normalizeWindowEvent(event: AWEvent): NormalizedWindowEvent {
  const data = event.data as AWCurrentWindowData;
  const app = data?.app ?? 'Unknown';
  const title = data?.title ?? '';
  const normalizedApp = app.toLowerCase().trim();
  const category: AppCategory = mapCategory(app, title);

  return {
    ...baseFields(event),
    bucketType: 'currentwindow',
    app,
    title,
    normalizedApp,
    category,
    url: null,
    packageName: null,
  };
}

/**
 * Normalizes an **AFK** event (`afkstatus` bucket from aw-watcher-afk).
 *
 * Data shape: `{ status: "afk" | "not-afk" }`
 *
 * @param event - Raw AWEvent with `afkstatus` payload.
 * @returns A fully populated `NormalizedAFKEvent`.
 */
export function normalizeAFKEvent(event: AWEvent): NormalizedAFKEvent {
  const data = event.data as AWAFKEventData;
  const status: 'afk' | 'not-afk' =
    data?.status === 'afk' || data?.status === 'not-afk' ? data.status : 'not-afk';

  return {
    ...baseFields(event),
    bucketType: 'afkstatus',
    status,
  };
}

/**
 * Normalizes a **web browser tab** event (`web.tab.current` bucket from
 * aw-watcher-web).
 *
 * Data shape: `{ url: string, title: string, audible: boolean,
 *   incognito: boolean, tabCount: number }`
 *
 * The `url` is used as the primary app identifier for categorization.
 *
 * @param event - Raw AWEvent with `web.tab.current` payload.
 * @returns A fully populated `NormalizedWindowEvent`.
 */
export function normalizeWebTabEvent(event: AWEvent): NormalizedWindowEvent {
  const data = event.data as AWWebTabData;
  const url = data?.url ?? '';
  const title = data?.title ?? '';
  const normalizedApp = url.toLowerCase().trim();
  const category: AppCategory = mapCategory(url, title);

  return {
    ...baseFields(event),
    bucketType: 'web.tab.current',
    app: url,
    title,
    normalizedApp,
    category,
    url,
    packageName: null,
  };
}

/**
 * Normalizes an **editor activity** event (`app.editor.activity` bucket from
 * aw-watcher-vscode, aw-watcher-jetbrains, etc.).
 *
 * Data shape: `{ file: string, project: string, language: string }`
 *
 * The `file` path is used as the primary app identifier. The language
 * is appended to the title for richer categorization.
 *
 * @param event - Raw AWEvent with `app.editor.activity` payload.
 * @returns A fully populated `NormalizedWindowEvent`.
 */
export function normalizeEditorEvent(event: AWEvent): NormalizedWindowEvent {
  const data = event.data as AWEditorActivityData;
  const file = data?.file ?? '';
  const language = data?.language ?? '';
  const project = data?.project ?? '';
  const app = file || language || 'Unknown Editor';
  const title = `${file}${language ? ` (${language})` : ''}`;
  const normalizedApp = app.toLowerCase().trim();
  // Editor events are always Development; the category mapper reinforces this
  const category: AppCategory = mapCategory(app, title) === 'Other' ? 'Development' : mapCategory(app, title);

  return {
    ...baseFields(event),
    bucketType: 'app.editor.activity',
    app,
    title,
    normalizedApp,
    category,
    url: null,
    packageName: null,
  };
}

/**
 * Normalizes an **Android** window event (`currentwindow` bucket from
 * aw-watcher-android).
 *
 * Data shape: `{ app: string, package: string, classname?: string }`
 *
 * Both the human label (`app`) and the package name (`package`) are stored.
 * The mapper checks **both** against the rule set for best match.
 *
 * @param event - Raw AWEvent with Android `currentwindow` payload.
 * @returns A fully populated `NormalizedWindowEvent`.
 */
export function normalizeAndroidEvent(event: AWEvent): NormalizedWindowEvent {
  const data = event.data as AWCurrentWindowData;
  const app = data?.app ?? 'Unknown';
  const pkg = data?.package ?? '';
  const className = data?.classname ?? '';
  const title = className || app;
  const normalizedApp = (pkg || app).toLowerCase().trim();
  // Try matching the package name first, then fall back to the app label
  let category: AppCategory = mapCategory(pkg || app, title);
  if (category === 'Other' && pkg) {
    category = mapCategory(app, title);
  }

  return {
    ...baseFields(event),
    bucketType: 'currentwindow',
    app,
    title,
    normalizedApp,
    category,
    url: null,
    packageName: pkg || null,
  };
}

/**
 * Normalizes an **Android screen unlock** event (`os.lockscreen.unlocks`
 * bucket from aw-watcher-android-unlock).
 *
 * Data shape: `{}` (empty object)
 *
 * @param event - Raw AWEvent with `os.lockscreen.unlocks` payload.
 * @returns A fully populated `NormalizedUnlockEvent`.
 */
export function normalizeUnlockEvent(event: AWEvent): NormalizedUnlockEvent {
  return {
    ...baseFields(event),
    bucketType: 'os.lockscreen.unlocks',
  };
}

// ────────────────────────────────────────────────────
// Batch normalizer — processes arrays of raw events
// ────────────────────────────────────────────────────

/**
 * Result of a batch normalization pass.
 */
export interface NormalizationResult {
  /** Successfully normalized window‑type events. */
  windowEvents: NormalizedWindowEvent[];
  /** Successfully normalized AFK events. */
  afkEvents: NormalizedAFKEvent[];
  /** Count of events that could not be normalized. */
  skippedCount: number;
}

/**
 * Normalizes an array of raw AWEvents from a single bucket.
 *
 * The correct normalizer is selected based on `bucketType`.
 * Events with unrecognized types are silently skipped.
 *
 * @param events - Array of raw AWEvent objects.
 * @param bucketType - The bucket's `type` field.
 * @returns Normalization result with typed arrays.
 */
export function normalizeBatch(
  events: AWEvent[],
  bucketType: string,
): NormalizationResult {
  const windowEvents: NormalizedWindowEvent[] = [];
  const afkEvents: NormalizedAFKEvent[] = [];
  let skippedCount = 0;

  for (const event of events) {
    switch (bucketType) {
      case 'currentwindow':
        // Desktop window watcher or Android watcher — we distinguish by
        // inspecting the data shape (Android has a `package` field).
        if (event.data && typeof event.data === 'object' && 'package' in event.data) {
          windowEvents.push(normalizeAndroidEvent(event));
        } else {
          windowEvents.push(normalizeWindowEvent(event));
        }
        break;

      case 'afkstatus':
        afkEvents.push(normalizeAFKEvent(event));
        break;

      case 'web.tab.current':
        windowEvents.push(normalizeWebTabEvent(event));
        break;

      case 'app.editor.activity':
        windowEvents.push(normalizeEditorEvent(event));
        break;

      // os.lockscreen.unlocks events are stored in the AFK array
      // for simplicity since they relate to user presence.
      case 'os.lockscreen.unlocks':
        // We treat unlock events as a specific AFK subtype for analysis
        // by storing them as AFK with a synthetic status.
        afkEvents.push({
          ...baseFields(event),
          bucketType: 'afkstatus',
          status: 'not-afk', // unlock implies user is present
        });
        break;

      default:
        skippedCount++;
        break;
    }
  }

  return { windowEvents, afkEvents, skippedCount };
}