/**
 * Central palette repository for the "Dark Intelligence" design system.
 * Every chart colour, category mapping, and score gradient lives here.
 *
 * @module lib/colors
 */

import type { AppCategory } from '@/types';

// ────────────────────────────────────────────────────
// Base design tokens (mirrors CSS custom properties)
// ────────────────────────────────────────────────────

export const tokens = {
  bg: {
    base: '#080d1a',
    surface: '#0f1629',
    elevated: '#172035',
  },
  border: {
    DEFAULT: '#1c2d4f',
    bright: '#243a65',
  },
  text: {
    primary: '#f0f4ff',
    secondary: '#8899bb',
    muted: '#4a5a7a',
  },
  accent: {
    cyan: '#00d4ff',
    violet: '#a78bfa',
    emerald: '#10b981',
    amber: '#f59e0b',
    rose: '#f43f5e',
  },
} as const;

// ────────────────────────────────────────────────────
// Category → colour mapping
// ────────────────────────────────────────────────────

/**
 * Maps every `AppCategory` to its dedicated chart colour.
 * Extend this object when adding a new category.
 */
export const categoryColors: Record<AppCategory, string> = {
  Development: tokens.accent.emerald,
  Browsing: tokens.accent.cyan,
  Communication: tokens.accent.violet,
  Entertainment: '#f97316', // warm orange
  Design: '#ec4899', // pink
  Productivity: '#14b8a6', // teal
  System: tokens.text.muted,
  Other: '#6b7280', // neutral gray
};

// ────────────────────────────────────────────────────
// Heatmap colour scale (5 levels: 0–4)
// ────────────────────────────────────────────────────

/**
 * Calendar heatmap colour scale.
 * Index 0 = no activity, 4 = highest intensity.
 */
export const heatmapScale = [
  tokens.bg.surface, // level 0 – matches card background
  '#0e4429',
  '#006d32',
  '#26a641',
  '#39d353',
] as const;

/**
 * Returns the hex colour for a heatmap cell given its level (0–4).
 *
 * @param level - Intensity level (clamped to 0–4).
 * @returns Hex colour string.
 */
export function getHeatmapColor(level: number): string {
  const clamped = Math.max(0, Math.min(4, Math.floor(level)));
  return heatmapScale[clamped]!;
}

// ────────────────────────────────────────────────────
// Score → colour helpers
// ────────────────────────────────────────────────────

/**
 * Maps a 0–100 score to a semantic colour.
 *  - 0–40   → emerald (healthy / low risk)
 *  - 41–70  → amber (moderate / caution)
 *  - 71–100 → rose (critical / high risk)
 *
 * @param score - Value between 0 and 100.
 * @returns Hex colour string.
 */
export function getScoreColor(score: number): string {
  if (score <= 40) return tokens.accent.emerald;
  if (score <= 70) return tokens.accent.amber;
  return tokens.accent.rose;
}

/**
 * Returns a CSS class name for text colouring based on score level.
 *
 * @param score - Value between 0 and 100.
 * @returns Tailwind text colour class.
 */
export function getScoreTextClass(score: number): string {
  if (score <= 40) return 'text-accent-emerald';
  if (score <= 70) return 'text-accent-amber';
  return 'text-accent-rose';
}

/**
 * Recharts‑compatible default chart colour palette.
 * Cycled through when multiple series need distinct colours.
 */
export const chartPalette: string[] = [
  tokens.accent.cyan,
  tokens.accent.violet,
  tokens.accent.emerald,
  tokens.accent.amber,
  tokens.accent.rose,
  '#f97316', // orange
  '#ec4899', // pink
  '#14b8a6', // teal
];

/**
 * Returns a colour from the palette for a given index, wrapping around.
 *
 * @param index - Zero‑based series index.
 * @returns Hex colour string.
 */
export function getChartColor(index: number): string {
  return chartPalette[index % chartPalette.length]!;
}