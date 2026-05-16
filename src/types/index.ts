/**
 * aw-insights — Single source of truth for all TypeScript types.
 *
 * This file contains every interface, type alias, and discriminated union
 * used across the application. It imports nothing from the runtime — only
 * other type declarations that live here.
 *
 * Updated with universal cross-platform support for:
 *   - Desktop (aw-watcher-window, aw-watcher-afk)
 *   - Web / Browser (aw-watcher-web)
 *   - Android (aw-watcher-android)
 *   - Editor watchers (aw-watcher-vscode, aw-watcher-jetbrains, etc.)
 *
 * @module types
 */

// ────────────────────────────────────────────────────────────────────────────
// Section 1 — ActivityWatch raw bucket & event models (UNIVERSAL)
// ────────────────────────────────────────────────────────────────────────────

/**
 * All known official ActivityWatch bucket event-type identifiers.
 *
 * - `currentwindow`       → aw-watcher-window (desktop) & aw-watcher-android
 * - `afkstatus`           → aw-watcher-afk
 * - `web.tab.current`     → aw-watcher-web (Chrome / Firefox extension)
 * - `app.editor.activity` → aw-watcher-vscode, aw-watcher-jetbrains, aw-watcher-vim …
 * - `os.lockscreen.unlocks` → Android lock‑screen events
 * - `unknown`             → fallback when the bucket type cannot be recognised
 */
export type BucketType =
  | 'currentwindow'
  | 'afkstatus'
  | 'web.tab.current'
  | 'app.editor.activity'
  | 'os.lockscreen.unlocks'
  | 'unknown';

/**
 * Represents a single ActivityWatch raw event as exported.
 * The `data` field shape depends on the bucket type.
 */
export interface AWEvent {
  /** ISO 8601 UTC timestamp of the event start (e.g. "2026-05-16T08:30:00.000Z"). */
  timestamp: string;
  /** Duration of the event in seconds. */
  duration: number;
  /** Payload; structure varies by bucket type. */
  data: unknown;
}

// ────────────────────────────────────────────────────────────────────────────
// Section 1a — Per‑bucket‑type data payload shapes
// ────────────────────────────────────────────────────────────────────────────

/**
 * Data payload for `currentwindow` events.
 * Used by **aw-watcher-window** (desktop) and **aw-watcher-android** (mobile).
 *
 * Desktop example:  `{ app: "Google Chrome", title: "GitHub · Where software is built" }`
 * Android example:  `{ app: "WhatsApp", package: "com.whatsapp", classname: "…" }`
 */
export interface AWCurrentWindowData {
  /** Human‑readable application name (desktop & android). */
  app: string;
  /** Window / activity title (desktop) or Android package name (mobile). */
  title?: string;
  /** Android package identifier (only present on Android events). */
  package?: string;
  /** Android activity class name (only present on Android events). */
  classname?: string;
}

/**
 * Data payload for `afkstatus` events (aw-watcher-afk).
 */
export interface AWAFKEventData {
  /** User presence status. */
  status: 'afk' | 'not-afk';
}

/**
 * Data payload for `web.tab.current` events (aw-watcher-web).
 */
export interface AWWebTabData {
  /** Full URL of the active browser tab. */
  url: string;
  /** Document title of the active tab. */
  title: string;
  /** Whether the tab is currently playing audio. */
  audible: boolean;
  /** Whether the tab is in incognito / private mode. */
  incognito: boolean;
  /** Total number of open tabs in the browser window. */
  tabCount: number;
}

/**
 * Data payload for `app.editor.activity` events
 * (aw-watcher-vscode, aw-watcher-jetbrains, aw-watcher-vim, etc.).
 */
export interface AWEditorActivityData {
  /** Full path to the currently edited file. */
  file: string;
  /** Project root path (or cwd). */
  project: string;
  /** Programming language of the file. */
  language: string;
}

/**
 * Data payload for `os.lockscreen.unlocks` events (Android unlock).
 * The data object is typically empty `{}`.
 */
export interface AWUnlockData {
  /** Currently unused — reserved for future fields. */
  [key: string]: unknown;
}

/**
 * Discriminated union of all known event data payloads.
 */
export type AWEventData =
  | AWCurrentWindowData
  | AWAFKEventData
  | AWWebTabData
  | AWEditorActivityData
  | AWUnlockData;

/**
 * A raw bucket as it appears in an ActivityWatch JSON export file.
 */
export interface AWBucket {
  /** Unique bucket identifier (e.g. "aw-watcher-window_myhost"). */
  id: string;
  /** Human-readable bucket name. */
  name: string;
  /**
   * Event‑type identifier that determines the schema of every event's `data`.
   * Examples: `"currentwindow"`, `"web.tab.current"`, `"afkstatus"`, …
   */
  type: string;
  /** Hostname of the machine that collected the data. */
  client: string;
  /** Hostname (often same as client). */
  hostname: string;
  /** ISO 8601 timestamp of bucket creation. */
  created: string;
  /** Optional extra metadata (version, label, etc.). */
  data: Record<string, unknown>;
  /** List of events contained in the bucket. */
  events: AWEvent[];
}

// ────────────────────────────────────────────────────────────────────────────
// Section 2 — Normalized / enriched events (after parsing & categorisation)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Application category assigned by the CategoryMapper.
 * Adding a new category here automatically makes it available
 * to all analysis modules and the UI.
 */
export type AppCategory =
  | 'Development'
  | 'Browsing'
  | 'Communication'
  | 'Entertainment'
  | 'Design'
  | 'Productivity'
  | 'System'
  | 'Other';

/**
 * Base normalized event that every processed event shares.
 */
export interface NormalizedEventBase {
  /** Original bucket type from which the event originated. */
  bucketType: BucketType;
  /** Original ISO timestamp preserved exactly. */
  rawTimestamp: string;
  /** Duration in milliseconds (derived from original seconds). */
  durationMs: number;
  /** Event start as a Date object (derived from rawTimestamp). */
  startTime: Date;
  /** Computed end time. */
  endTime: Date;
}

/**
 * Normalized event representing a window / app activity entry.
 * This is the universal shape — all platform‑specific data (desktop, web, android, editor)
 * is mapped into this one interface so downstream analytics never cares about the source.
 */
export interface NormalizedWindowEvent extends NormalizedEventBase {
  bucketType: 'currentwindow' | 'web.tab.current' | 'app.editor.activity';
  /** Original window / tab / activity title. */
  title: string;
  /**
   * Application name as reported by the watcher.
   * For desktop: process name (e.g. "Code.exe").
   * For android: human app label (e.g. "WhatsApp").
   * For web: the URL (used for domain extraction).
   */
  app: string;
  /** Lowercased, trimmed, cleaned application name for matching. */
  normalizedApp: string;
  /** Category assigned by the CategoryMapper. */
  category: AppCategory;
  /** Original URL (only present for web events, null otherwise). */
  url: string | null;
  /** Android package name (only present for android events, null otherwise). */
  packageName: string | null;
}

/**
 * Normalized event representing an AFK status change.
 */
export interface NormalizedAFKEvent extends NormalizedEventBase {
  bucketType: 'afkstatus';
  /** User presence status. */
  status: 'afk' | 'not-afk';
}

/**
 * Normalized event representing a screen unlock (Android).
 */
export interface NormalizedUnlockEvent extends NormalizedEventBase {
  bucketType: 'os.lockscreen.unlocks';
}

/**
 * Union of all normalized events; used as the primary data type
 * flowing through the analytics engine.
 */
export type NormalizedEvent =
  | NormalizedWindowEvent
  | NormalizedAFKEvent
  | NormalizedUnlockEvent;

// ────────────────────────────────────────────────────────────────────────────
// Section 3 — Analytics output types (one per insight module)
// ────────────────────────────────────────────────────────────────────────────

/**
 * A single focus session detected by the FocusAnalyzer.
 */
export interface FocusSession {
  /** Application in focus during the session. */
  app: string;
  /** Category of the application. */
  category: AppCategory;
  /** Session start time. */
  startTime: Date;
  /** Session end time. */
  endTime: Date;
  /** Total uninterrupted minutes in the session. */
  durationMinutes: number;
  /** Whether the session qualifies as a "deep focus" session (≥ deepFocusMinMinutes). */
  isDeepFocus: boolean;
}

/**
 * Full output of the FocusAnalyzer.
 */
export interface FocusAnalysis {
  /** Total number of focus sessions detected. */
  sessionCount: number;
  /** Average session length in minutes. */
  averageSessionDurationMinutes: number;
  /** Number of sessions that reached the deep-focus threshold. */
  deepFocusSessionCount: number;
  /** Total context switches (app changes) across the dataset. */
  totalSwitches: number;
  /**
   * Fragility score (0–100).
   * Higher values indicate more context switching and less sustained focus.
   */
  fragilityScore: number;
  /**
   * Hourly fragility map. Keys are 0–23, values represent
   * the average switches per hour across all analysed days.
   */
  hourlyFragility: Record<number, number>;
  /**
   * Weekday pattern (0 = Sunday … 6 = Saturday).
   * Values are the average number of switches on that day.
   */
  weekdayPattern: Record<number, number>;
  /** Overall focus score (0–100). */
  overallScore: number;
  /** The granular sessions list (used for charts and drill-downs). */
  sessions: FocusSession[];
}

/**
 * A single flow session identified by the FlowDetector.
 */
export interface FlowSession {
  /** The category (or categories) of work that induced flow. */
  category: AppCategory;
  /** Start time of the flow block. */
  startTime: Date;
  /** End time. */
  endTime: Date;
  /** Duration in uninterrupted flow minutes. */
  durationMinutes: number;
  /** Computed intensity (0–1) based on category weight and duration curve. */
  intensity: number;
}

/**
 * Full output of the FlowDetector.
 */
export interface FlowAnalysis {
  /** Total minutes spent in flow state. */
  totalFlowMinutes: number;
  /** Number of distinct flow sessions. */
  flowSessionCount: number;
  /** Average flow session duration in minutes. */
  averageFlowDurationMinutes: number;
  /** Ratio of flow time to total tracked productive time (0–1). */
  flowRatio: number;
  /** Top three peak hours by total flow minutes. */
  peakHours: { hour: number; minutes: number }[];
  /** Overall flow score (0–100). */
  intensityScore: number;
  /** All detected flow sessions for detailed views. */
  sessions: FlowSession[];
}

/**
 * Individual factor scores that drive the burnout prediction.
 */
export interface BurnoutFactorScores {
  /** Late-night work factor (0–100). */
  lateNightScore: number;
  /** Weekly overload factor (0–100). */
  overloadScore: number;
  /** Weekend intrusion factor (0–100). */
  weekendIntrusionScore: number;
  /** Recovery deficit factor (0–100). */
  recoveryDeficitScore: number;
}

/**
 * Burnout risk level labels.
 */
export type BurnoutRiskLevel = 'low' | 'moderate' | 'high' | 'critical';

/**
 * Full output of the BurnoutPredictor.
 */
export interface BurnoutAnalysis {
  /** Overall burnout risk score (0–100). */
  burnoutScore: number;
  /** Qualitative risk level derived from the score. */
  riskLevel: BurnoutRiskLevel;
  /** Scores for each of the four contributing factors. */
  factorScores: BurnoutFactorScores;
  /**
   * Trend comparing the first half of the dataset to the second half.
   * - 'improving' when score decreases by ≥5 points
   * - 'worsening' when score increases by ≥5 points
   * - 'stable' otherwise
   */
  trend: 'improving' | 'stable' | 'worsening';
  /** Human-readable warning messages based on the analysis. */
  warnings: string[];
}

/**
 * A single day summary used as input to the BurnoutPredictor
 * and for timeline visualisation.
 */
export interface DailySummary {
  /** Date in YYYY-MM-DD format. */
  date: string;
  /** Total tracked minutes across all categories. */
  totalMinutes: number;
  /** Tracked minutes in productive categories. */
  productiveMinutes: number;
  /** Start of the first event (null if no events). */
  firstEventAt: Date | null;
  /** End of the last event (null if no events). */
  lastEventAt: Date | null;
  /** Hour-of-day distribution of productive minutes (0–23). */
  hourlyProductivity: Record<number, number>;
  /** Was this day a weekend? (Saturday or Sunday). */
  isWeekend: boolean;
}

/**
 * A single cell in the calendar heatmap.
 */
export interface HeatmapEntry {
  /** Date in YYYY-MM-DD format. */
  date: string;
  /** Total productive minutes on that day. */
  value: number;
  /** Qualitative level derived from value thresholds (0–4 for color scale). */
  level: number;
}

/**
 * Full output of the TimelineBuilder.
 */
export interface TimelineAnalysis {
  /** Daily aggregate summaries for every day in the dataset. */
  dailyAggregates: DailySummary[];
  /** Heatmap data ready for calendar visualisation. */
  heatmapData: HeatmapEntry[];
}

// ────────────────────────────────────────────────────────────────────────────
// Section 4 — Module configuration interfaces (tunable thresholds)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Configuration for the FocusAnalyzer.
 * All values are exposed so users can adjust them via the UI.
 */
export interface FocusConfig {
  /**
   * Maximum gap in seconds between two consecutive same-app events
   * to still consider them part of the same session. Default: 120.
   */
  sessionGapThresholdSeconds: number;
  /**
   * Minimum session length in minutes to qualify as a deep focus session.
   * Default: 25.
   */
  deepFocusMinMinutes: number;
  /**
   * Threshold below which a session is considered "fragmented"
   * for scoring purposes (minutes). Default: 5.
   */
  fragmentedThresholdMinutes: number;
}

/**
 * Configuration for the FlowDetector.
 */
export interface FlowConfig {
  /**
   * Minimum continuous productive minutes required to detect a flow state.
   * Default: 25.
   */
  minDurationMinutes: number;
  /**
   * Maximum interruption gap in seconds; interruptions below this
   * threshold are ignored (considered brief switching). Default: 180.
   */
  maxInterruptionSeconds: number;
  /**
   * List of categories considered productive and eligible for flow detection.
   */
  productiveCategories: AppCategory[];
}

/**
 * Configuration for the BurnoutPredictor.
 */
export interface BurnoutConfig {
  /**
   * Hour after which work is considered "late night" (24-hour format).
   * Default: 22 (10 PM).
   */
  lateNightHour: number;
  /**
   * Daily productive hours threshold; exceeding this triggers overload scoring.
   * Default: 7.
   */
  overloadThresholdHours: number;
  /**
   * Minimum minutes of activity on a weekend day to count as intrusion.
   * Default: 30.
   */
  weekendThresholdMinutes: number;
}

/**
 * Union type for passing any module config.
 */
export type ModuleConfig = FocusConfig | FlowConfig | BurnoutConfig;

// ────────────────────────────────────────────────────────────────────────────
// Section 5 — Dataset & application state types
// ────────────────────────────────────────────────────────────────────────────

/**
 * Possible states of the user's dataset.
 */
export type DatasetStatus = 'idle' | 'loading' | 'loaded' | 'error';

/**
 * Error information when dataset loading fails.
 */
export interface DatasetError {
  /** Human-readable error message. */
  message: string;
  /** Optional machine-readable error code. */
  code?: string;
}

/**
 * Represents the full dataset currently loaded in memory.
 * Stored inside Zustand's data slice.
 */
export interface Dataset {
  /** Current processing status. */
  status: DatasetStatus;
  /** Error details if status is 'error'. */
  error: DatasetError | null;
  /** All normalized window events (sorted by time). */
  windowEvents: NormalizedWindowEvent[];
  /** All normalized AFK events. */
  afkEvents: NormalizedAFKEvent[];
  /** Daily summaries built from the data. */
  dailySummaries: DailySummary[];
  /** UTC timestamp of when the data was last processed. */
  processedAt: string | null;
}

// ────────────────────────────────────────────────────────────────────────────
// Section 6 — Web Worker communication types
// ────────────────────────────────────────────────────────────────────────────

/**
 * Message sent from the main thread to the parser worker.
 */
export interface ParserWorkerRequest {
  /** Unique correlation id echoed in the response. */
  id: string;
  /** The raw JSON string of the ActivityWatch export. */
  payload: string;
}

/**
 * Typed progress update emitted by the parser worker.
 */
export interface ParserWorkerProgress {
  /** Type discriminator. */
  type: 'progress';
  /** Correlation id matching the original request. */
  id: string;
  /** Current step description. */
  step: string;
  /** Progress percentage (0–100). */
  percent: number;
}

/**
 * Successful parse result emitted by the parser worker.
 */
export interface ParserWorkerResult {
  /** Type discriminator. */
  type: 'result';
  /** Correlation id matching the original request. */
  id: string;
  /** Array of all normalized window events. */
  windowEvents: NormalizedWindowEvent[];
  /** Array of all normalized AFK events. */
  afkEvents: NormalizedAFKEvent[];
  /** Daily summaries built inside the worker. */
  dailySummaries: DailySummary[];
}

/**
 * Error response from the parser worker.
 */
export interface ParserWorkerError {
  /** Type discriminator. */
  type: 'error';
  /** Correlation id. */
  id: string;
  /** Error description. */
  message: string;
}

/**
 * Union of all messages the parser worker can send to the main thread.
 */
export type ParserWorkerResponse =
  | ParserWorkerProgress
  | ParserWorkerResult
  | ParserWorkerError;

// ────────────────────────────────────────────────────────────────────────────
// Section 7 — Category mapping rule definition
// ────────────────────────────────────────────────────────────────────────────

/**
 * A single rule used by the CategoryMapper to classify apps.
 *
 * The `pattern` is a RegExp tested against the **normalized app name**.
 * For desktop: process name (e.g. "code.exe", "figma").
 * For android: package name OR app label (e.g. "com.whatsapp", "WhatsApp").
 * For web: the URL (e.g. "github.com/ActivityWatch/...").
 */
export interface CategoryRule {
  /** Regular expression pattern (case‑insensitive matching is assumed by the mapper). */
  pattern: RegExp;
  /** Category to assign when the pattern matches. */
  category: AppCategory;
}

// ────────────────────────────────────────────────────────────────────────────
// Section 8 — UI preference & i18n types
// ────────────────────────────────────────────────────────────────────────────

/**
 * Supported languages (ISO 639‑1 codes).
 * When adding a new language, extend this union.
 */
export type SupportedLanguage = 'en' | 'de' | 'es' | 'fr' | 'ja' | 'zh' | 'pt';

/**
 * User preferences persisted in IndexedDB and applied globally.
 */
export interface UserPreferences {
  /** Selected display language. */
  language: SupportedLanguage;
  /** `'dark'` | `'light'` (dark is the default). */
  theme: 'dark' | 'light';
  /** Whether the onboarding / upload guide has been dismissed. */
  hasSeenOnboarding: boolean;
}

// ────────────────────────────────────────────────────────────────────────────
// Section 9 — Generic insight module contract
// ────────────────────────────────────────────────────────────────────────────

/**
 * Contract that every insight module must implement.
 * @template TInput - The data the module consumes.
 * @template TOutput - The analysis result it produces.
 * @template TConfig - The configuration shape the module accepts.
 */
export interface InsightModule<
  TInput,
  TOutput,
  TConfig extends ModuleConfig,
> {
  /**
   * Run the analysis on the provided input data.
   * @param input - Normalized events or daily summaries.
   * @param config - Optional overrides for the default configuration.
   * @returns The complete analysis output.
   */
  analyze(input: TInput, config?: Partial<TConfig>): TOutput;

  /**
   * Returns the module's default configuration values.
   */
  getDefaultConfig(): TConfig;
}