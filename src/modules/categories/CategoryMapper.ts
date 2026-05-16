/**
 * CategoryMapper — classifies application identifiers from any platform
 * (desktop process names, Android packages / labels, web URLs) into a
 * standard `AppCategory` using the external `RULE_SET`.
 *
 * ## How it works
 * 1. Accept a raw `appName` (could be a process name, package id, or full URL)
 *    and an optional `windowTitle` (used as a secondary signal).
 * 2. Normalize the app name: lowercase, strip common noise.
 * 3. Walk the `RULE_SET` in order. The **first** matching rule wins.
 * 4. If no rule matches, return `'Other'`.
 *
 * ## Extending
 * Add new patterns to `rules.ts`. You never need to touch this file.
 *
 * @module modules/categories/CategoryMapper
 */

import type { AppCategory, CategoryRule } from '@/types';
import { RULE_SET } from './rules';

/**
 * Removes common noise from app names so regex matching is more reliable.
 *
 * @param app - Raw application identifier.
 * @returns Cleaned, lowercased string.
 */
function sanitizeAppName(app: string): string {
  return app
    .toLowerCase()
    .replace(/[_-]/g, ' ') // treat underscores & hyphens as spaces
    .replace(/\s+/g, ' ') // collapse whitespace
    .trim();
}

/**
 * Extracts the domain from a full URL for domain‑based matching.
 *
 * @param url - Full URL string (e.g. "https://github.com/ActivityWatch").
 * @returns Lowercased domain (e.g. "github.com"), or the original string
 *          if it doesn't look like a URL.
 */
function extractDomain(url: string): string {
  try {
    // Handles both "https://example.com/path" and bare "example.com/path"
    const withProtocol = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    const parsed = new URL(withProtocol);
    return parsed.hostname.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

/**
 * Maps a platform‑agnostic application identifier to a standard category.
 *
 * @param appName - The raw app identifier:
 *   - Desktop: process name (e.g. "Code.exe", "Google Chrome").
 *   - Android: package name (e.g. "com.whatsapp") or label (e.g. "WhatsApp").
 *   - Web: full URL (e.g. "https://github.com/ActivityWatch/...").
 * @param windowTitle - Optional window / tab title for secondary matching.
 * @returns The matched `AppCategory`, or `'Other'` if no rule fires.
 */
export function mapCategory(appName: string, windowTitle: string = ''): AppCategory {
  const sanitized = sanitizeAppName(appName);
  const domain = extractDomain(appName);
  const titleSanitized = sanitizeAppName(windowTitle);

  for (const rule of RULE_SET) {
    // Try matching against the sanitized app name…
    if (rule.pattern.test(sanitized)) {
      return rule.category;
    }

    // …the extracted domain (relevant for web URLs)…
    if (domain !== sanitized && rule.pattern.test(domain)) {
      return rule.category;
    }

    // …and the window title as a fallback signal.
    if (titleSanitized.length > 0 && rule.pattern.test(titleSanitized)) {
      return rule.category;
    }
  }

  return 'Other';
}

/**
 * Class implementation of the category mapper — conforms to the project
 * pattern of exporting instantiable classes from modules.
 */
export class CategoryMapper {
  /** Reference to the external rule set (read‑only at runtime). */
  private readonly rules: CategoryRule[];

  /**
   * @param customRules - Optional override rules. If omitted, uses the
   *   default `RULE_SET` from `rules.ts`.
   */
  constructor(customRules?: CategoryRule[]) {
    this.rules = customRules ?? RULE_SET;
  }

  /**
   * Classifies an app identifier into a standard category.
   *
   * @param app - The raw app identifier (process name, package id, or URL).
   * @param title - Optional window / tab title.
   * @returns The matched `AppCategory`.
   */
  map(app: string, title: string = ''): AppCategory {
    return mapCategory(app, title);
  }

  /**
   * Returns the current rule set (useful for debugging / UI inspection).
   */
  getRules(): CategoryRule[] {
    return [...this.rules];
  }
}