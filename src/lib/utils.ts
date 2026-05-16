/**
 * Pure utility helpers used across the application.
 * No side effects, no React imports, 100% testable.
 *
 * @module lib/utils
 */

/**
 * Formats a duration given in seconds into a human-readable string.
 * Examples: 65 → "1m 5s", 3661 → "1h 1m 1s", 0 → "0s"
 *
 * @param seconds - Non‑negative number of seconds.
 * @returns Formatted string with hours, minutes, and seconds as applicable.
 */
export function formatSeconds(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));

  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;

  const parts: string[] = [];
  if (h > 0) {
    parts.push(`${h}h`);
  }
  if (m > 0 || h > 0) {
    parts.push(`${m}m`);
  }
  parts.push(`${s}s`);

  return parts.join(' ');
}

/**
 * Groups elements of an array by a key derived from each element.
 *
 * @param array - The source array.
 * @param keyGetter - Function that extracts the grouping key.
 * @returns Object whose keys are the group identifiers and values the matching elements.
 *
 * @example
 * groupBy([{a:1}, {a:1}, {a:2}], x => x.a)
 * // { "1": [{a:1},{a:1}], "2": [{a:2}] }
 */
export function groupBy<T>(
  array: T[],
  keyGetter: (item: T) => string,
): Record<string, T[]> {
  const result: Record<string, T[]> = {};
  for (const item of array) {
    const key = keyGetter(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key]!.push(item);
  }
  return result;
}

/**
 * Clamps a numeric value between a minimum and maximum boundary.
 *
 * @param val - The value to clamp.
 * @param min - Lower bound (inclusive).
 * @param max - Upper bound (inclusive).
 * @returns The clamped value.
 */
export function clamp(val: number, min: number, max: number): number {
  if (val < min) return min;
  if (val > max) return max;
  return val;
}

/**
 * Merges multiple class name candidates into a single space‑separated string,
 * filtering out falsy values.
 *
 * Designed as a drop‑in replacement for the `cn()` pattern used with Tailwind.
 *
 * @param classes - Strings, undefined, or false values.
 * @returns Merged class string.
 */
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Returns the ISO week number (1–53) of a given date.
 *
 * @param date - The date to evaluate.
 * @returns ISO week number.
 */
export function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * Rounds a number to the specified number of decimal places.
 *
 * @param value - The number to round.
 * @param decimals - Number of decimal digits (default 1).
 * @returns Rounded value.
 */
export function roundToDecimals(value: number, decimals = 1): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/**
 * Converts a Date object to a YYYY‑MM‑DD string in local time.
 *
 * @param date - The date to format.
 * @returns Date string.
 */
export function toDateString(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Converts a YYYY‑MM‑DD string to a local Date set to midnight.
 *
 * @param dateStr - Date string in YYYY‑MM‑DD format.
 * @returns Local Date at midnight.
 */
export function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number) as [
    number,
    number,
    number,
  ];
  return new Date(year!, (month! - 1), day!);
}

/**
 * Returns the number of days in the range [startDate, endDate] inclusive.
 *
 * @param start - Start date string YYYY‑MM‑DD.
 * @param end - End date string YYYY‑MM‑DD.
 * @returns Day count.
 */
export function daysBetween(start: string, end: string): number {
  const msPerDay = 86400000;
  const s = parseDateString(start).getTime();
  const e = parseDateString(end).getTime();
  return Math.floor((e - s) / msPerDay) + 1;
}

/**
 * Checks if a given Date falls on a weekend (Saturday or Sunday).
 *
 * @param date - The date to test.
 * @returns True if Saturday or Sunday.
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}