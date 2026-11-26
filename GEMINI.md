# GEMINI.md — OrangeHRM Enterprise QA Automation Rules

This document codifies the non-negotiable engineering, architectural, and safety rules for `orangehrm-bdd-playwright`. Every human engineer and AI agent working in this repository MUST follow these standards.

## 1. Shared Demo Environment Safety (CRITICAL)
- Target environment: `https://opensource-demo.orangehrmlive.com/` (shared public sandbox that resets periodically).
- **NEVER** modify, disable, rename, change the password of, or delete the default `Admin` user account.
- **NEVER** delete or mutate pre-seeded system records (default job titles, pay grades, locations, leave types, or existing employees not created by the active test run).
- All CRUD operations (`@pim`, `@admin`, `@leave`, `@recruitment`) MUST generate uniquely prefixed records (`AutoQA_<timestamp>_<random>`) via `utils/testDataFactory.js` and register them in the scenario `cleanupRegistry` so the `After` hook deletes them cleanly even on failure.
- Never invalidate the shared `playwright/.auth/admin.json` session cookie: scenarios that test Login/Logout or ESS login (`@guest`) MUST clear cookies before authenticating with an isolated session.
- **Locale Resilience**: Public visitors periodically switch OrangeHRM's global UI language (e.g., to French). Login forms (`setup/auth.setup.js`, `LoginPage`, `BasePage`) MUST use locale-proof controls (`input[name="username"]`, `input[name="password"]`, `button[type="submit"]`), and `setup/auth.setup.js` + `BasePage.gotoPath` automatically restore `language: 'en_US'` via `/web/index.php/api/v2/admin/localization` (preserving active `dateFormat`) whenever a non-English locale is detected.

## 2. Clean Page Object Model (POM) Boundaries
- `pages/` MUST encapsulate **locators and user interactions only**.
- **ZERO `expect()` assertions** are allowed inside `pages/` or `utils/`. All assertions belong exclusively in `steps/**/*.steps.js`.
- Every module page class extends `BasePage` (`pages/BasePage.js`) and reuses its Vue.js UI helpers.
- `steps/` files are wired via `fixtures/bddFixtures.js` (`createBdd(test)` where `test` is exported from `fixtures/bddFixtures.js`).

## 3. Zero-Flakiness Standard (OrangeHRM Vue.js / OXD UI Patterns)
- **STRICTLY FORBIDDEN**: `page.waitForTimeout()` or any hardcoded `setTimeout` / `sleep`.
- Always rely on Playwright web-first auto-retrying assertions (`await expect(locator).toBeVisible()`, `toContainText()`, `toHaveURL()`, etc.).
- Use deterministic helpers in `BasePage` / `utils/uiHelpers.js` for OrangeHRM's OXD Vue components:
  - **Spinners**: Wait for `.oxd-loading-spinner` and `.oxd-form-loader` to detach/hide (`waitForSpinnerToDisappear()`).
  - **Toast notifications**: Read `.oxd-toast` / `.oxd-toast-content-text` (`waitForToast()`).
  - **Custom dropdowns**: Locate form group by `.oxd-input-group` label text -> click `.oxd-select-text` -> wait for `[role="listbox"]` -> click `[role="option"]`.
  - **Autocomplete typeaheads**: Fill `Type for hints...` -> wait for `[role="listbox"]` loading state (`Searching....`) to resolve -> click matching `[role="option"]`.
  - **Date pickers**: Fill date inputs matching the displayed placeholder format (`yyyy-dd-mm` or `yyyy-mm-dd`) and blur/close calendar cleanly.

## 4. Resilient Semantic Locator Hierarchy
Prefer locators in this strict order (verified against live DOM accessibility trees):
1. `getByRole(role, { name })`
2. `getByPlaceholder(...)` / `getByLabel(...)`
3. `getByText(...)` (exact or scoped to container)
4. Scoped OXD structural containers (`.oxd-input-group:has(...)`, `.oxd-table-card`, `.oxd-toast`) only where OrangeHRM's Vue components omit native `<label for>` bindings.
5. Never use brittle generated CSS class hashes or deep XPath indices.

## 5. Security & Credentials Hygiene
- Never hardcode credentials in `features/`, `steps/`, or `pages/`.
- Load `BASE_URL`, `ADMIN_USERNAME`, and `ADMIN_PASSWORD` from `process.env` (via `dotenv` and `fixtures/bddFixtures.js`), with safe demo fallback defaults only in configuration/fixture layer.
- `.env` and `playwright/.auth/` MUST remain in `.gitignore`.

## 6. Mandatory Bidirectional Traceability (REQ -> TC -> @TC)
- Every feature module has:
  - PRD: `docs/prd/<module-slug>.md` with atomic `REQ-<MOD>-XX` IDs.
  - Test Case Matrix: `docs/test-cases/<module-slug>.md` with 1:1 `TC-<MOD>-XX` IDs mapped to `REQ-<MOD>-XX`.
  - Feature File: `features/<module-slug>.feature` with `@<module-slug>`, priority (`@P0`/`@P1`/`@P2`), suite (`@smoke`/`@regression`/`@e2e`), and `@TC-<MOD>-XX` tags.
- `docs/TRACEABILITY.md` tracks 100% end-to-end coverage and must pass `qa-traceability` audit with zero gaps.

## 7. Wiring Convention (`playwright-bdd`)
- `playwright.config.js` configures:
  - `features: 'features/**/*.feature'`
  - `steps: ['steps/**/*.steps.js', 'fixtures/bddFixtures.js']`
  - `outputDir: '.features-gen'`
- Always run `npx bddgen` before `playwright test` to validate step binding integrity.
