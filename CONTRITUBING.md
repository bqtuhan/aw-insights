# Contributing to AW Insights

Thank you for considering contributing to **AW Insights — Digital Life Intelligence**! 🚀

This document outlines everything you need to contribute effectively, from your first bug fix to building an entirely new analytics module. Our goal is to make contributing **fast, clear, and rewarding**.

---

## 📜 Code of Conduct

All contributors are expected to adhere to our [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). Please read it before participating.

---

## ⚡ Quick Start (Development Environment)

```bash
# 1. Fork & clone
git clone https://github.com/YOUR_USERNAME/aw-insights.git
cd aw-insights

# 2. Install dependencies
npm install

# 3. Start dev server with hot reload
npm run dev

# 4. Run type checking (keep it green)
npm run type-check

# 5. Run linter
npm run lint
```

Node.js version: See .nvmrc — pinned to an LTS release. Use nvm use if available.

---

🧱 Project Architecture (Quick Tour)

Directory / File Purpose
src/types/index.ts Single source of truth for all TypeScript interfaces
src/lib/ Pure utility functions, IndexedDB wrapper, scoring formulas, chart defaults
src/modules/ Analytics engine — pure TypeScript classes, zero React
src/workers/ Web Worker for parsing ActivityWatch JSON off the main thread
src/store/ Zustand state management (data slice + UI slice)
src/hooks/ React hooks bridging the store and analytics modules
src/components/ React components (layout, UI primitives, dashboard sections)
src/i18n/ i18next configuration and locale dictionaries
public/locales/ Lazy-loaded JSON translation files

Golden rule: Business logic never lives in React components. All analysis code lives in src/modules/ and is imported by hooks, never by components directly.

---

🧪 Adding a New Insight Module (30 minutes)

One of the project's core design goals is that a junior developer can add a new analytics module in 30 minutes. Here's how:

Step-by-step

1. Create the module directory
      src/modules/your-feature/
2. Define the module class
      Implement the InsightModule contract from src/types/index.ts:
   ```typescript
   import type { InsightModule, ModuleConfig } from '@/types';
   
   export class YourAnalyzer implements InsightModule<InputType, OutputType, YourConfig> {
     analyze(input: InputType, config?: Partial<YourConfig>): OutputType {
       // Pure analysis logic here
     }
   
     getDefaultConfig(): YourConfig {
       return {
         // Sensible defaults
       };
     }
   }
   ```
3. Add output types to src/types/index.ts
      Define your analysis result interface (e.g., YourAnalysis).
4. Create a hook in src/hooks/ that instantiates your module and uses useMemo to reactively compute results.
5. Create a dashboard section in src/components/dashboard/YourSection.tsx that consumes the hook and renders charts.
6. Add the section to the navigation in src/components/layout/Sidebar.tsx and the router in src/App.tsx.
7. Add translations for all your UI strings in public/locales/en/common.json (and other languages).
8. Write a README for your module in src/modules/your-feature/README.md explaining the algorithm.
9. Run tests/lint/type-check before submitting.

For a concrete example, study the existing FocusAnalyzer, FlowDetector, and BurnoutPredictor modules — they all follow this exact pattern.

---

🌍 Adding a New Language (15 minutes)

Adding full i18n support for a new language is designed to be trivial:

1. Create the locale file
      Copy public/locales/en/common.json to public/locales/XX/common.json (where XX is the ISO 639-1 code).
2. Translate every value in the JSON — keep the keys identical.
3. Register the language in src/i18n/config.ts:
      Add the code to the supportedLngs array:
   
```typescript
   supportedLngs: ['en', 'de', 'es', 'fr', 'ja', 'zh', 'pt', 'XX'],
   ```
4. Add to the type system (optional but recommended):
      Update the SupportedLanguage union type in src/types/index.ts.
5. Add hreflang tag in index.html for SEO.

That's it — the language will automatically appear in the language switcher (Header component reads the supportedLngs array dynamically).

---

🎨 Extending Category Rules

The category mapping engine matches application names, Android package names, and web URLs to categories using a simple rule array.

To add support for a new app:

1. Open src/modules/categories/rules.ts.
2. Add a new object to the RULE_SET array:
   ```typescript
   { pattern: /your-app|app\.exe/i, category: 'Development' }
   ```
   · The pattern is tested case-insensitively against the normalized app name (lowercased, trimmed).
   · For Android apps, use the package name (e.g., com.example.app).
   · For web, use the domain or URL path.
   · Rules are matched in order — more specific patterns should come before generic ones.

No other files need to be touched. The CategoryMapper class reads this array automatically.

---

🔧 Code Quality Standards

We enforce strict quality rules automatically (CI will catch violations):

· TypeScript strict mode with noUncheckedIndexedAccess and exactOptionalPropertyTypes.
· Zero any types — if absolutely necessary, use // eslint-disable-next-line with a reason.
· Explicit return types on all exported functions.
· Named exports only (except page components which use default export).
· No hardcoded English strings in React components — use t() from react-i18next or the dictionary helper.
· Pure functions in src/lib/ and src/modules/ — no side effects, no DOM access.
· All chart styling goes through src/lib/chartDefaults.ts.
· All scoring formulas are centralized in src/lib/scoring.ts.

Before submitting:

```bash
npm run type-check   # Must pass with zero errors
npm run lint         # Must pass with zero warnings
```

---

📤 Pull Request Process

1. Create a feature branch from main:
      git checkout -b feat/my-awesome-feature
2. Make your changes following the patterns above.
3. Write clear commit messages (conventional commits preferred: feat:, fix:, docs:, etc.).
4. Push and open a Pull Request against main.
5. Fill out the PR template — it will ask you to confirm:
   · Type checks pass
   · Lint passes
   · New features have translations
   · New modules have a README
6. Wait for review — a maintainer will respond within a few days. CI must be green before merging.

---

🐛 Reporting Bugs

Use the Bug Report issue template.

Include:

· Steps to reproduce
· Expected vs actual behavior
· ActivityWatch version and export format
· Browser and OS
· Any error messages from the console

---

💡 Feature Requests

Use the Feature Request template.

We especially welcome ideas for:

· New insight modules (sleep tracking, mood correlation, etc.)
· Additional ActivityWatch bucket support
· Export/report generation
· UI/UX improvements

---

⭐ First-Time Contributors

Look for issues labeled good first issue — these are specifically curated to be approachable for newcomers. Feel free to ask questions in the issue comments!

---

📄 Licensing

By contributing, you agree that your contributions will be licensed under the same AGPLv3 license that covers the project.

---

Thank you for helping make digital wellness analytics accessible, private, and open-source! 💙
```
