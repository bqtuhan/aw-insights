# AW Insights — Digital Life Intelligence

> **Transform your ActivityWatch exports into a world-class analytics dashboard.**  
> Reveal flow states, burnout risk, and focus intelligence — 100% in your browser.  
> **Zero data leaves your machine. Ever.**

<p align="center">
  <img src="https://img.shields.io/badge/vite-6.0-%23646CFF?logo=vite" alt="Vite 6" />
  <img src="https://img.shields.io/badge/react-19.2-%2361DAFB?logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/typescript-5.7-%233178C6?logo=typescript" alt="TypeScript 5.7" />
  <img src="https://img.shields.io/badge/zustand-5.0-%23443E38" alt="Zustand 5" />
  <img src="https://img.shields.io/badge/tailwind-4.0-%2306B6D4?logo=tailwindcss" alt="Tailwind 4" />
  <img src="https://img.shields.io/badge/recharts-3.8-%2322B5BF" alt="Recharts 3.8" />
  <img src="https://img.shields.io/badge/license-AGPLv3-blue.svg" alt="AGPLv3" />
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome" />
</p>

---

## ✨ Features

| Module | Description | Key Metrics |
|--------|-------------|-------------|
| **Focus Analyzer** | Context-switch detection, session building, fragility scoring | Switches/hr, deep focus count, weekday pattern |
| **Flow Detector** | Csikszentmihalyi-inspired flow state identification | Flow minutes, intensity curves, peak hours |
| **Burnout Predictor** | Multi-factor clinical risk model | Late-night %, overload, weekend intrusion, recovery deficit |
| **App Breakdown** | Universal category mapping (desktop, web, Android) | Time per category, distribution charts |
| **Timeline Heatmap** | Calendar-grid activity visualization | 5-level intensity scale, daily drill-down |

### 🔒 Privacy by Design
- No analytics, no tracking, no telemetry
- All processing via Web Worker in a separate thread
- IndexedDB for local persistence only
- Strict Content-Security-Policy — no external requests after page load
- No cookies; localStorage only for language/theme preferences

---

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/bqtuhan/aw-insights.git
cd aw-insights

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open in browser
open http://localhost:5173
```

Building for production:

```bash
npm run build
npm run preview
```

---

📐 Architecture

```
User drops JSON file
        │
        ▼
┌───────────────────┐
│   Dropzone UI     │  (React component)
└───────┬───────────┘
        │ FileReader API
        ▼
┌───────────────────┐
│  Parser Worker    │  (Web Worker — separate thread)
│  ┌─────────────┐  │
│  │  AWParser   │  │  JSON.parse → normalizeBatch → sort
│  │  normalize  │  │  Desktop / Web / Android / Editor
│  └──────┬──────┘  │
└─────────┼─────────┘
          │ postMessage (typed)
          ▼
┌───────────────────┐
│  Zustand Store    │  dataSlice + uiSlice
│  (React state)    │
└───────┬───────────┘
        │
        ▼
┌───────────────────┐
│  Analytics Engine  │  FocusAnalyzer / FlowDetector /
│  (Pure TS modules) │  BurnoutPredictor / TimelineBuilder
└───────┬───────────┘
        │
        ▼
┌───────────────────┐
│  React Dashboard  │  MetricCard / Charts / Heatmap
│  (Tailwind +      │  Recharts + Framer Motion
│   Recharts)       │
└───────────────────┘
```

---

🎨 Design System

"Dark Intelligence" — premium data terminal meets modern SaaS.

Token Value Usage
--bg-base #080d1a Deepest background
--bg-surface #0f1629 Cards, panels
--accent-cyan #00d4ff Primary actions, flow
--accent-violet #a78bfa Focus, secondary
--accent-emerald #10b981 Success, healthy scores
--accent-rose #f43f5e Danger, burnout critical

Typography: Syne (display), Inter (body), JetBrains Mono (data)

---

🌍 Internationalization

· 7 languages supported: English, German, Spanish, French, Japanese, Chinese, Portuguese
· Adding a new language = 1 JSON file + 1 line in src/i18n/config.ts
· Lazy-loaded per language via i18next-http-backend

---

🗺️ Roadmap

Phase Status Deliverables
Phase 1 ✅ Complete Core analytics engine, dashboard UI, i18n, PWA
Phase 2 🔜 Planned Export reports (PDF), custom category rules UI
Phase 3 📋 Backlog Multi-dataset comparison, trend forecasting
Phase 4 💡 Ideas AI-powered insights, browser extension companion

---

🤝 Contributing

Contributions are enthusiastically welcomed! See CONTRIBUTING.md for:

· How to add a new insight module in 30 minutes
· How to add a new language in 15 minutes
· How to extend the category mapping rules
· Pull request checklist

---

📄 License

This project is licensed under the GNU Affero General Public License v3.0 — see LICENSE for the full text.

---

⭐ Star History

<p align="center">
  <a href="https://github.com/bqtuhan/aw-insights/stargazers">
    <img src="https://img.shields.io/github/stars/bqtuhan/aw-insights?style=social" alt="GitHub stars" />
  </a>
</p>

---

<p align="center">
  <sub>Built with ❤️ by <a href="https://github.com/bqtuhan">bqtuhan</a> · Privacy-First · Open Source · AGPLv3</sub>
</p>
