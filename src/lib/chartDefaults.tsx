/**
 * Centralised Recharts styling defaults for the "Dark Intelligence" aesthetic.
 * Every chart in the app uses these presets to ensure visual consistency.
 *
 * @module lib/chartDefaults
 */

import { tokens } from './colors';

/**
 * Typing helper for Recharts tooltip content props (version‑agnostic).
 */
type TooltipContentProps = {
  active?: boolean;
  payload?: ReadonlyArray<{
    name?: string;
    value?: any;
    color?: string;
    payload?: any;
  }>;
  label?: any;
};

// ────────────────────────────────────────────────────
// Shared axis & grid presets
// ────────────────────────────────────────────────────

/** Default XAxis configuration. */
export const xAxisDefaults = {
  tick: { fill: tokens.text.muted, fontSize: 12, fontFamily: 'JetBrains Mono, monospace' },
  axisLine: { stroke: tokens.border.DEFAULT },
  tickLine: { stroke: tokens.border.DEFAULT },
};

/** Default YAxis configuration. */
export const yAxisDefaults = {
  tick: { fill: tokens.text.muted, fontSize: 12, fontFamily: 'JetBrains Mono, monospace' },
  axisLine: { stroke: tokens.border.DEFAULT },
  tickLine: { stroke: tokens.border.DEFAULT },
};

/** Default CartesianGrid configuration. */
export const gridDefaults = {
  strokeDasharray: '3 3',
  stroke: tokens.border.DEFAULT,
  opacity: 0.4,
};

// ────────────────────────────────────────────────────
// Tooltip component
// ────────────────────────────────────────────────────

/**
 * Custom Recharts tooltip content matching the dark UI theme.
 *
 * Renders a compact, rounded panel with category colours.
 */
export function DarkTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        background: tokens.bg.elevated,
        border: `1px solid ${tokens.border.bright}`,
        borderRadius: 12,
        padding: '8px 12px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
      }}
    >
      {label && (
        <p
          style={{
            color: tokens.text.secondary,
            fontSize: 11,
            fontFamily: 'JetBrains Mono, monospace',
            marginBottom: 4,
          }}
        >
          {label}
        </p>
      )}
      {payload.map((entry, idx) => (
        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
          <span
            style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: 2,
              backgroundColor: entry.color,
            }}
          />
          <span style={{ color: tokens.text.secondary, fontSize: 12 }}>{entry.name}:</span>
          <span style={{ color: tokens.text.primary, fontSize: 12, fontWeight: 600 }}>
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Default tooltip props (can be spread on <Tooltip />). */
export const tooltipDefaults = {
  content: DarkTooltip,
  cursor: { stroke: tokens.border.bright, strokeWidth: 1 },
};

// ────────────────────────────────────────────────────
// Legend presets
// ────────────────────────────────────────────────────

/** Default legend wrapper style. */
export const legendDefaults = {
  wrapperStyle: {
    color: tokens.text.secondary,
    fontSize: 12,
    paddingTop: 12,
  },
};

// ────────────────────────────────────────────────────
// Responsive container defaults
// ────────────────────────────────────────────────────

/**
 * Default ResponsiveContainer props.
 * Ensures charts never overflow their parent.
 */
export const responsiveContainerDefaults = {
  width: '100%',
  aspect: 16 / 9, // fallback; can be overridden
};
