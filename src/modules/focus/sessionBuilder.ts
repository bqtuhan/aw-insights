/**
 * Focus session builder — groups consecutive, same‑app `NormalizedWindowEvent`
 * items into uninterrupted `FocusSession` objects.
 *
 * ## Algorithm
 * 1. Events are expected to be **pre‑sorted by `startTime`** (ascending).
 * 2. Consecutive events that share the **same `normalizedApp`** and whose
 *    end‑to‑start gap is **less than `sessionGapThresholdSeconds`** are merged
 *    into a single session.
 * 3. A session is flagged as **deep focus** when its total duration reaches
 *    or exceeds `deepFocusMinMinutes`.
 *
 * ## Edge cases
 * - An empty input returns an empty array.
 * - A single event always forms a one‑event session.
 * - Overlapping events are handled gracefully (the later start time is used
 *   for gap calculation).
 *
 * @module modules/focus/sessionBuilder
 */

import type { NormalizedWindowEvent, FocusSession } from '@/types';
import { clamp } from '@/lib/utils';

// ────────────────────────────────────────────────────
// Configuration defaults (overridable by FocusConfig)
// ────────────────────────────────────────────────────

/** Default maximum gap in seconds between consecutive same‑app events. */
const DEFAULT_SESSION_GAP_SECONDS = 120;

/** Default minimum minutes to qualify as deep focus. */
const DEFAULT_DEEP_FOCUS_MINUTES = 25;

// ────────────────────────────────────────────────────
// Public API
// ────────────────────────────────────────────────────

/**
 * Builds focus sessions from a chronologically sorted array of window events.
 *
 * @param events - Normalized window events sorted by `startTime` ascending.
 * @param sessionGapThresholdSeconds - Max gap (in seconds) between consecutive
 *   same‑app events before they're considered separate sessions.
 * @param deepFocusMinMinutes - Minimum session length to mark as deep focus.
 * @returns Array of `FocusSession` objects.
 */
export function buildSessions(
  events: NormalizedWindowEvent[],
  sessionGapThresholdSeconds: number = DEFAULT_SESSION_GAP_SECONDS,
  deepFocusMinMinutes: number = DEFAULT_DEEP_FOCUS_MINUTES,
): FocusSession[] {
  if (events.length === 0) return [];

  const sessions: FocusSession[] = [];

  // Start the first session with the first event.
  let currentSession = createSessionFromEvent(events[0]!);
  if (events.length === 1) {
    finalizeSession(currentSession, deepFocusMinMinutes);
    sessions.push(currentSession);
    return sessions;
  }

  for (let i = 1; i < events.length; i++) {
    const prevEvent = events[i - 1]!;
    const currEvent = events[i]!;

    // Gap in seconds between previous event end and current event start.
    const gapSeconds =
      (currEvent.startTime.getTime() - prevEvent.endTime.getTime()) / 1000;

    const sameApp = currEvent.normalizedApp === prevEvent.normalizedApp;

    if (sameApp && gapSeconds < sessionGapThresholdSeconds) {
      // Extend the current session.
      currentSession.endTime = currEvent.endTime;
      currentSession.durationMinutes += currEvent.durationMs / 60000;
    } else {
      // Close the current session and start a new one.
      finalizeSession(currentSession, deepFocusMinMinutes);
      sessions.push(currentSession);
      currentSession = createSessionFromEvent(currEvent);
    }
  }

  // Don't forget the last session.
  finalizeSession(currentSession, deepFocusMinMinutes);
  sessions.push(currentSession);

  return sessions;
}

// ────────────────────────────────────────────────────
// Internal helpers
// ────────────────────────────────────────────────────

/**
 * Creates a new `FocusSession` seeded from a single event.
 */
function createSessionFromEvent(event: NormalizedWindowEvent): FocusSession {
  return {
    app: event.app,
    category: event.category,
    startTime: event.startTime,
    endTime: event.endTime,
    durationMinutes: event.durationMs / 60000,
    isDeepFocus: false, // set in finalizeSession
  };
}

/**
 * Clamps duration to a sane precision and sets the `isDeepFocus` flag.
 */
function finalizeSession(
  session: FocusSession,
  deepFocusMinMinutes: number,
): void {
  // Round to 1 decimal place for cleanliness.
  session.durationMinutes = Math.round(session.durationMinutes * 10) / 10;
  session.isDeepFocus = session.durationMinutes >= deepFocusMinMinutes;
}