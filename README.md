# OrangeHRM Enterprise HRIS — Playwright BDD Automation Framework

Enterprise-grade, zero-flakiness QA automation suite for **OrangeHRM OS 5.x** (`https://opensource-demo.orangehrmlive.com/`) built with **Playwright**, **playwright-bdd** (Gherkin/Cucumber), and the **Page Object Model (POM)**.

## Architecture & Folder Layout

```text
orangehrm-bdd-playwright/
├── docs/
│   ├── 00-test-strategy.md          # Risk-based QA Lead Test Strategy
│   ├── TRACEABILITY.md              # Master REQ -> TC -> @TC Traceability Matrix
│   ├── prd/                         # System Overview & per-module PRDs (REQ-<MOD>-XX)
│   └── test-cases/                  # ISTQB Test Case Matrices (TC-<MOD>-XX)
├── features/                        # Business-readable Gherkin .feature files
├── fixtures/
│   └── bddFixtures.js               # Playwright-BDD fixtures, POM DI & auto-cleanup hooks
├── pages/
│   ├── BasePage.js                  # Shared navigation & OrangeHRM OXD Vue helpers
│   └── *Page.js                     # Module Page Objects (locators & actions only)
├── setup/
│   └── auth.setup.js                # Authenticated storageState generator (Admin session)
├── steps/                           # Gherkin step definitions & web-first assertions
├── utils/
│   ├── testDataFactory.js           # Collision-free AutoQA_* HR data & cleanup registry
│   └── uiHelpers.js                 # Deterministic OXD spinner/toast/dropdown utilities
├── .env.example                     # Environment variable template
├── GEMINI.md                        # Codified QA architecture & governance rules
├── Jenkinsfile                      # Windows-compatible Jenkins Declarative Pipeline
├── package.json
└── playwright.config.js
```

## Prerequisites & Setup

1. **Node.js** v18+ (tested on Node v26 / npm 11).
2. Install dependencies:
   ```bash
   npm install
   ```
3. (Optional) Copy `.env.example` to `.env` to override defaults:
   ```bash
   cp .env.example .env
   ```
4. Ensure browser channels are available (local Google Chrome / Microsoft Edge, or `npx playwright install firefox` for Firefox).

## Authentication & Session Reuse (`storageState`)

- `setup/auth.setup.js` runs once per test invocation as the `setup` project, authenticates as `ADMIN_USERNAME` / `ADMIN_PASSWORD`, and stores session state at `playwright/.auth/admin.json` (git-ignored).
- Authenticated HR module suites reuse `playwright/.auth/admin.json` with automatic session-expiry recovery in `BasePage`.
- Unauthenticated & session-lifecycle scenarios (`@guest`) clear browser cookies before interacting with `/auth/login` so they never invalidate the shared `storageState` server session.

## Local Execution Commands

| Command | Purpose |
| --- | --- |
| `npm run bdd:gen` | Transpile `.feature` files into `.features-gen/` and validate step definitions |
| `npm run test:smoke` | Execute P0 critical-path `@smoke` scenarios |
| `npm run test:regression` | Execute full `@regression` scenarios |
| `npm run test:bdd` | Generate BDD specs and run all configured browser projects |
| `npx playwright test --project=bdd-chrome` | Run full suite on Chrome |
| `npx playwright test --project=bdd-chrome --grep @smoke` | Run smoke suite on Chrome |
| `npx playwright test --project=bdd-firefox --grep @smoke` | Run smoke suite on Firefox |
| `npx playwright test --project=bdd-edge --grep @smoke` | Run smoke suite on Edge |
| `npm run report` | Open the generated Playwright HTML Report |

## Shared Demo Sandbox Safety

- All CRUD tests create uniquely prefixed entities (`AutoQA_<timestamp>_<random>`) and clean them up automatically via the `After` hook in `fixtures/bddFixtures.js`.
- The default `Admin` account and pre-seeded demo data are never mutated or deleted.

## CI/CD Pipeline (`Jenkinsfile`)

The Windows-compatible Declarative `Jenkinsfile` runs on Jenkins (`orangehrm-playwright-ci`):
1. Checks out `main` from `aldopontoh/orangehrm-bdd-playwright`.
2. Installs dependencies (`npm ci` with `npm install` fallback).
3. Verifies browser readiness for the selected `BROWSER_PROJECT` (`bdd-chrome`, `bdd-edge`, `bdd-firefox`).
4. Runs `npx bddgen` and `npx playwright test` (with optional `GREP_TAGS`).
5. Always archives `test-results/**` and `playwright-report/**` and publishes JUnit XML (`test-results/junit.xml`).
