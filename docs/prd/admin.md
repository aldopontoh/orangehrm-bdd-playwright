# PRD: Admin — User & RBAC Management (`admin`)

## 1. Module Overview, Business Objective & Risk Priority
- **Business Objective**: Control HRIS system access via role-based access control (Admin vs. ESS), strong password enforcement, and full System User provisioning, status management, and deprovisioning.
- **Risk Priority**: **Critical (P0)**

## 2. Entry Points, Routes & Role Preconditions
- **Routes**:
  - System Users: `/web/index.php/admin/viewSystemUsers`
  - Add System User: `/web/index.php/admin/saveSystemUser`
- **Role Preconditions**: Authenticated `Admin` session for User Management; isolated `@guest` session for ESS RBAC login verification. **NEVER modify or delete the default `Admin` user.**

## 3. Atomic Functional Requirements
- **REQ-ADM-01**: Admins shall be able to search System Users by `Username` (e.g., `Admin`) and `User Role` (`Admin` / `ESS`), displaying matching rows in the System Users table without mutating default accounts.
- **REQ-ADM-02**: Admins shall be able to create a new `ESS` System User linked to an existing `AutoQA_*` employee via the `Employee Name` typeahead (`Type for hints...`), `User Role`, `Status`, `Username`, `Password`, and `Confirm Password`, persisting the account with `"Successfully Saved"`.
- **REQ-ADM-03**: Add System User shall validate required fields, minimum password length (`"Should have at least 7 characters"`), password complexity (lowercase + number), and confirm-password mismatch (`"Passwords do not match"`).
- **REQ-ADM-04**: Admins shall be able to edit an `AutoQA_*` System User's `Status` (`Enabled` -> `Disabled`), save the update (`"Successfully Updated"`), and delete the test user cleanly via the confirmation modal (`"Successfully Deleted"`).
- **REQ-ADM-05**: An `AutoQA_*` employee provisioned with an `Enabled` ESS login (via PIM Create Login Details or Admin Add User) shall be able to authenticate on `/auth/login`, land on `/dashboard/index`, and be restricted from accessing privileged `Admin` and `Maintenance` side-menu modules.

## 4. Verified UI Inventory & Resilient Locators
| Element | Verified Semantic Locator |
| --- | --- |
| Admin / System Users Headings | `page.getByRole('heading', { name: 'Admin', level: 6 })`, `page.getByRole('heading', { name: 'System Users', level: 5 })` |
| Add User Heading | `page.getByRole('heading', { name: 'Add User', level: 6 })` |
| User Role Dropdown | `.oxd-input-group:has(label:text-is("User Role")) .oxd-select-text` |
| Status Dropdown | `.oxd-input-group:has(label:text-is("Status")) .oxd-select-text` |
| Employee Name Typeahead | `.oxd-input-group:has(label:text-is("Employee Name")) input[placeholder="Type for hints..."]` |
| Username Input | `.oxd-input-group:has(label:text-is("Username")) input` |
| Password / Confirm Password | `.oxd-input-group:has(label:text-is("Password")) input`, `.oxd-input-group:has(label:text-is("Confirm Password")) input` |
| Action Buttons | `page.getByRole('button', { name: 'Add' \| 'Search' \| 'Reset' \| 'Save' \| 'Cancel' })` |
| Row Edit / Delete Icons | Row `button:has(.bi-pencil-fill)` and `button:has(.bi-trash)` |

## 5. Validation Rules, Boundary Conditions & Timing
- Username: minimum 5 characters; must be unique (`"Already exists"` if duplicated).
- Password: minimum 7 characters, must include at least 1 lowercase letter and 1 number (`Strong` / `Very Strong` indicator when upper + lower + number + symbol included, e.g., `AutoQa@2026!`).
- Autocomplete typeahead displays `"Searching...."` before rendering `[role="option"]`; wait for `"Searching...."` to disappear before clicking the employee option.

## 6. Testable Acceptance Criteria
- **Given** an `AutoQA_*` employee exists, **When** an Admin adds an `ESS` user for that employee, **Then** the user appears in System Users search results.
- **Given** an `AutoQA_*` ESS user logs in on a clean guest session, **When** the Dashboard loads, **Then** the `Admin` and `Maintenance` links are NOT visible in the Sidepanel navigation.
