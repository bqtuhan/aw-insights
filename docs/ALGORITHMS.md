# Algorithm Reference — aw-insights

This document provides the complete mathematical specifications for the three core analytical engines.

---

## 1. Focus Analyzer

### Overview
Measures sustained attention by detecting continuous application sessions, counting context switches, and deriving a composite 0–100 focus score.

### Session Building
```

Input: NormalizedWindowEvent[] (sorted by startTime)
Parameter: sessionGapThresholdSeconds (default: 120)

For each consecutive pair of events (prev, curr):
gapSeconds = curr.startTime - prev.endTime
if prev.normalizedApp == curr.normalizedApp AND gapSeconds < sessionGapThresholdSeconds:
merge into current session
else:
finalize current session, start new session

A session is "deep focus" if durationMinutes >= deepFocusMinMinutes (default: 25)

```

### Context Switch Counting
```

totalSwitches = count of consecutive event pairs where normalizedApp differs

```

### Fragility Score (0–100)
```

switchesPerHour = totalSwitches / totalTrackedHours
fragilityScore = min(switchesPerHour, 30) / 30 * 100

```
Capped at 30 switches/hour — anything above is maximum fragmentation.

### Hourly Fragility Map
For each hour (0–23), compute average switches across all days containing that hour:
```

hourlyFragility[h] = totalSwitchesInHour[h] / distinctDaysWithHour[h]

```

### Weekday Pattern
For each day of week (0=Sun … 6=Sat), compute average switches:
```

weekdayPattern[d] = sum(switches on day d) / count(day d occurrences)

```

### Composite Focus Score
Weighted sum of three sub-components:
```

switchScore = (1 - switchesPerHour/30) * 100          (40% weight)
depthScore  = 20 * log2(avgSessionMinutes + 1)         (35% weight)
deepScore   = deepFocusRatio * 100                      (25% weight)

overallScore = 0.40 * switchScore + 0.35 * depthScore + 0.25 * deepScore

```
Clamped to 0–100. Higher = better focus.

---

## 2. Flow Detector

### Overview
Identifies flow states based on Csikszentmihalyi's model: uninterrupted, challenging, productive work. Only productive categories qualify.

### Flow Block Detection
```

Input: NormalizedWindowEvent[] (sorted), productiveCategories set
Parameters:
minDurationMinutes (default: 25)
maxInterruptionSeconds (default: 180)

Scan events sequentially:

1. Skip non-productive events (they break any open block)
2. If gap between consecutive events > maxInterruptionSeconds, break the block
3. A block with total duration >= minDurationMinutes becomes a FlowSession

Block duration = sum of all constituent event durations (not calendar span)

```

### Intensity Scoring
Uses a sigmoid (logistic) curve parameterized for duration:
```

intensity(t) = 1 / (1 + exp(-k * (t - t0)))
where:
k = 0.12 (steepness)
t0 = 25 (midpoint in minutes)

Properties:

· 5 min  → intensity ≈ 0.05
· 25 min → intensity ≈ 0.50
· 60 min → intensity ≈ 0.98
· 90+ min → intensity → 1.00

Final intensity = sigmoid(durationMinutes) * categoryWeight

```

### Category Weights
| Category | Weight |
|----------|--------|
| Development | 1.00 |
| Design | 1.00 |
| Productivity | 0.85 |
| Browsing | 0.50 |
| Communication | 0.50 |
| Entertainment | 0.20 |
| System | 0.10 |
| Other | 0.10 |

### Peak Hours
Distribute each session's flow minutes across the hours it spans. Aggregate per hour and return top 3.

### Flow Score (0–100)
```

flowRatio = totalFlowMinutes / totalProductiveMinutes
volumeBonus = min(10, (totalFlowMinutes / 600) * 10)

flowScore = (flowRatio * 100) + volumeBonus

```
Clamped to 0–100. The volume bonus (max 10 points) distinguishes users with identical ratios but different absolute volumes.

---

## 3. Burnout Predictor

### Overview
Multi-factor weighted model based on clinical burnout research. Operates on `DailySummary[]` aggregates rather than raw events.

### Four-Factor Model

| Factor | Weight | Description |
|--------|--------|-------------|
| Late Night Work | 35% | % of active days with work between 22:00–06:00 |
| Weekly Overload | 30% | 7-day rolling average vs. 7h threshold |
| Weekend Intrusion | 20% | % of weekend days with >30 min activity |
| Recovery Deficit | 15% | % of high-load days in last 14 days × streak multiplier |

### Factor 1 — Late Night Work
```

For each active day (totalMinutes > 0):
lateNightFraction = productiveMinutes in [22, 6] / total productive minutes
accumulate fractions across days

lateNightScore = average(lateNightFractions) * 100

```
Range: 0–100. Higher = more late-night work.

### Factor 2 — Weekly Overload
```

Slide a 7-day window across the dataset:
avgHours = totalProductiveMinutes(window) / 7 / 60
if avgHours > 7:
excess = avgHours - 7
normalisedExcess = (excess / 3) * 100  // 3h excess = 100

overloadScore = max(normalisedExcess across all windows)

```
Range: 0–100. Capped at 3 hours excess (3h above threshold = score of 100).

### Factor 3 — Weekend Intrusion
```

weekendDays = days where isWeekend == true
intrudedDays = weekendDays with productiveMinutes > 30

weekendIntrusionScore = (intrudedDays / weekendDays) * 100

```
Range: 0–100. Only days present in the dataset are counted (gaps excluded).

### Factor 4 — Recovery Deficit
```

Look at last 14 days in dataset:
highLoadDays = days where productiveHours >= 7
baseScore = (highLoadDays / 14) * 100

Count consecutive high-load days from most recent backward:
streak = count of consecutive high-load days

streakMultiplier:
streak >= 5 → 1.70
streak = 4  → 1.50
streak = 3  → 1.30
streak = 2  → 1.15
else        → 1.00

recoveryDeficitScore = baseScore * streakMultiplier

```
Range: 0–100. Capped at 100.

### Composite Burnout Score
```

burnoutScore = 0.35 * lateNightScore
+ 0.30 * overloadScore
+ 0.20 * weekendIntrusionScore
+ 0.15 * recoveryDeficitScore

```
Clamped to 0–100. Higher = greater burnout risk.

### Risk Level Classification
| Score Range | Level |
|-------------|-------|
| 0–25 | Low |
| 26–50 | Moderate |
| 51–75 | High |
| 76–100 | Critical |

### Trend Detection
```

Split dataset by day count at midpoint (first 50% vs last 50%):
Compute burnout score for each half
delta = secondHalfScore - firstHalfScore

delta <= -5 → "improving"
delta >= +5 → "worsening"
else       → "stable"

```

---

## Data Safety Notes

- **No calendar-span subtraction**: All temporal metrics use actual event durations or pre-aggregated `DailySummary` boundaries. Tracking gaps (nights, weekends with no data) do not dilute the statistics.
- **No double-counting**: The Flow Detector scans a single event stream. Multi-source overlap (desktop + web) is resolved at the parser level before analysis.
- **Gap filling**: The Burnout Predictor injects zero-activity records for missing calendar dates so that rolling windows and streak calculations accurately reflect real resting periods.
```
