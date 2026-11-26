# OrangeHRM Enterprise HRIS — Risk-Based QA Test Strategy

## 1. Executive Summary & Objective
This Test Strategy defines the risk-based quality engineering approach for **OrangeHRM OS 5.9** (`https://opensource-demo.orangehrmlive.com/`). The goal is to achieve deterministic, zero-flakiness automated regression coverage across all 8 core Enterprise HRIS modules using **Playwright**, **playwright-bdd (Gherkin)**, and the **Page Object Model (POM)**, backed by 100% bidirectional traceability (`REQ -> TC -> @TC`) and automated Jenkins CI/CD execution.

## 2. Scope

### 2.1 In-Scope Modules (8 Core HRIS Journeys)
| Module Slug | Module Name | Primary Business Capabilities |
| --- | --- | --- |
| `auth` | Authentication & Session Management | Valid/invalid login, CSRF `_token`, inline required validation, session persistence, logout, post-logout back-button/route protection, Forgot Password |
| `dashboard` | Dashboard & Global Shell | Core HR widgets, side-navigation live search filter, side-panel collapse/expand, Quick Launch shortcuts, Topbar profile menu |
| `pim` | PIM — Employee Lifecycle Management | Employee creation (`AutoQA_*`), list search/filter/reset, Personal Details & Job tab updates, inline validation, safe UI deletion |
| `admin` | Admin — User & RBAC Management | System user search, ESS/Admin account provisioning, password strength/mismatch rules, edit/disable/delete lifecycle, ESS vs. Admin RBAC isolation |
| `leave` | Leave Management | Leave List filters & status chips, Leave Entitlement provisioning, Assign Leave workflow, Leave cancellation, date-range validation |
| `time` | Time & Attendance | Employee Timesheets lookup, My Timesheet period/status inspection, Attendance Punch In / Punch Out state toggle |
| `recruitment` | Recruitment | Candidate creation with resume attachment, email/required validation, Candidate search & cleanup, Vacancies grid & hiring workflow |
| `my-info` | My Info — Employee Self-Service | Personal Details shell, Contact Details email validation, Emergency Contacts table & form validation |

### 2.2 Out-of-Scope
- Destructive mutations to the default `Admin` user account or pre-seeded system configuration (Job Titles, Locations, Pay Grades, Leave Types).
- Third-party external links (OrangeHRM Upgrade marketing page, LinkedIn/Facebook/Twitter/YouTube footers).
- Load/stress testing (covered separately by k6/JMeter performance suites) and email SMTP delivery (disabled in public demo sandbox).

## 3. Risk Assessment Matrix

| Module | Risk Level | Primary Failure Impact | Mitigation Strategy |
| --- | --- | --- | --- |
| **Auth (`auth`)** | **Critical** | Unauthorized HRIS/PII access, session hijacking, broken logout | Dedicated `@guest` isolated-cookie scenarios; post-logout back-button & direct-URL guards |
| **Admin / RBAC (`admin`)** | **Critical** | Privilege escalation (ESS accessing Admin/Maintenance), weak passwords | Cross-module `@e2e` ESS login RBAC check; password policy boundary validation |
| **PIM (`pim`)** | **High** | Corrupted employee PII, broken onboarding, orphaned records | `AutoQA_*` unique IDs; strict `After` hook cleanup; Personal & Job tab persistence verification |
| **Leave (`leave`)** | **High** | Incorrect leave balances, invalid date ranges, broken approval/cancel states | Entitlement + Assign Leave + Cancel lifecycle on isolated `AutoQA_*` employee; dynamic `yyyy-dd-mm`/`yyyy-mm-dd` date formatting |
| **Recruitment (`recruitment`)** | **Medium** | Candidate pipeline loss, broken resume uploads, missing vacancies | Dynamic resume file buffer upload; graceful handling of empty demo Vacancies table; candidate cleanup |
| **Time (`time`)** | **Medium** | Inaccurate payroll timesheets or broken Punch In/Out state toggle | State-aware Punch In/Out handling (detects current state before toggling) |
| **Dashboard (`dashboard`)** | **Medium** | Broken global shell navigation or missing executive HR widgets | Widget visibility assertions independent of volatile demo user names |
| **My Info (`my-info`)** | **Medium** | Self-service profile validation bypass or accidental PII mutation | Non-destructive validation checks on Admin profile; isolated ESS profile checks |

## 4. Test Pyramid & Tagging Strategy

- **Unit/Syntax Gate (`bddgen`)**: Fast static check ensuring 100% Gherkin-to-step binding integrity before browser launch.
- **UI Functional & BDD Layer (`playwright-bdd`)**:
  - `@smoke` (`P0`): 11 fast, critical-path scenarios spanning all 8 modules (~2–3 minutes). Run on every PR/commit and quick sanity checks.
  - `@regression` (`P0`/`P1`/`P2`): 22 deep functional, negative, boundary-value, state-transition, and accessibility scenarios.
  - `@e2e`: Cross-module HR lifecycle journeys (e.g., PIM Onboarding -> Admin ESS Provisioning -> ESS Login RBAC Audit).
  - `@guest`: Scenarios requiring an unauthenticated browser context (`context.clearCookies()`) so they never invalidate the shared `storageState` Admin session.
  - `@employee`, `@user-admin`, `@leave`, `@recruitment`: Tags marking CRUD tests that register created entities in `cleanupRegistry`.

## 5. Environment & Cross-Browser Matrix

| Dimension | Configuration |
| --- | --- |
| **Target URL** | `https://opensource-demo.orangehrmlive.com` (configurable via `BASE_URL`) |
| **Execution Workers** | `workers: 1` (prevents shared-account PHP session collisions and demo rate-limiting) |
| **Browsers** | `bdd-chrome` (Primary CI & local), `bdd-edge` (Enterprise Windows channel), `bdd-firefox` (Cross-engine Gecko verification) |
| **Auth Reuse** | `setup/auth.setup.js` persists `playwright/.auth/admin.json`; auto-recovery in `BasePage` if demo resets mid-run |
| **Diagnostics** | `trace: 'on-first-retry'`, `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`, HTML + JSON + JUnit XML reporters |

## 6. Shared-Sandbox Test Data Isolation Strategy
1. **Unique Prefixing**: Every generated employee, system user, candidate, or vacancy uses `AutoQA_<timestamp>_<random>` via `utils/testDataFactory.js`.
2. **Zero Pre-Seeded Mutations**: The default `Admin` account and existing employees are strictly read-only. Never assert hardcoded Admin display names (other public demo users frequently rename Admin's profile).
3. **Self-Cleaning Hooks**: Every created entity is pushed onto the scenario's `cleanupRegistry`. The Playwright-BDD `After` hook in `fixtures/bddFixtures.js` deletes registered System Users, Candidates, Vacancies, and Employees in reverse dependency order, even when a scenario fails.
4. **Dynamic Date & Dropdown Handling**: Date helpers inspect the live input `placeholder` (`yyyy-dd-mm` vs `yyyy-mm-dd`) at runtime; dropdown helpers select deterministic options via `.oxd-select-text` -> `[role="listbox"]` -> `[role="option"]`.

## 7. Entry & Exit Criteria

### Entry Criteria
- `https://opensource-demo.orangehrmlive.com/` is reachable and login succeeds with configured `ADMIN_USERNAME` / `ADMIN_PASSWORD`.
- `npx bddgen` compiles with 0 errors and `qa-traceability` confirms 100% `REQ -> TC -> @TC` coverage.
- Static QA audit confirms 0 `waitForTimeout`, 0 `expect()` in `pages/`, and 0 hardcoded credentials.

### Exit Criteria
- **Smoke Gate**: 100% pass rate on `@smoke` (`bdd-chrome`).
- **Release / CI Gate**: 100% pass rate on the configured Jenkins pipeline suite (`orangehrm-playwright-ci`), JUnit XML + HTML report archived, and zero orphaned `AutoQA_*` records left in the sandbox.
