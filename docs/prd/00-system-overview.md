# System Overview PRD — OrangeHRM OS 5.9 Enterprise HRIS

## 1. Application Under Test (AUT)
- **Product**: OrangeHRM Open Source (OS 5.9)
- **Base URL**: `https://opensource-demo.orangehrmlive.com/`
- **Architecture**: PHP/Symfony REST backend + Vue.js 3 SPA frontend built on OrangeHRM's **OXD** component library.
- **Roles**:
  - `Guest`: Unauthenticated visitor restricted to `/web/index.php/auth/login` and `/web/index.php/auth/requestPasswordResetCode`.
  - `Admin`: Full HR administrator with access to all 12 side-panel modules (`Admin`, `PIM`, `Leave`, `Time`, `Recruitment`, `My Info`, `Performance`, `Dashboard`, `Directory`, `Maintenance`, `Claim`, `Buzz`).
  - `ESS` (Employee Self-Service): Standard employee with restricted navigation (no `Admin` or `Maintenance` modules).

## 2. Verified Global OXD UI Patterns (Live DOM Audit)
All module PRDs inherit these verified OrangeHRM OS 5.9 component contracts:

| UI Pattern | Verified Selector / Accessibility Contract | Handling Rule |
| --- | --- | --- |
| **Page Title** | `<title>OrangeHRM</title>` | Constant across all routes |
| **Module Header** | `.oxd-topbar-header-breadcrumb-module` (`heading` level 6) | Primary route verification landmark |
| **Side Navigation** | `getByRole('navigation', { name: 'Sidepanel' })`, search `getByPlaceholder('Search')`, collapse `.oxd-main-menu-button` | Toggles `aside.oxd-sidepanel.toggled` |
| **Topbar User Menu** | `.oxd-userdropdown-tab` -> `[role="menuitem"]` (`About`, `Support`, `Change Password`, `Logout`) | Never assert hardcoded user display name |
| **Loading Spinners** | `.oxd-loading-spinner`, `.oxd-form-loader` | Must detach/hide before interacting or asserting |
| **Toast Banners** | `.oxd-toast` (`.oxd-toast-content-title`, `.oxd-toast-content-text`) | `Success` / `Info` / `Error` transient feedback |
| **Inline Validation** | `.oxd-input-field-error-message` | Renders `"Required"`, password strength, or format errors |
| **Custom Select** | `.oxd-input-group:has(label:text-is("<Label>")) .oxd-select-text` -> `[role="listbox"]` -> `[role="option"]` | OXD dropdown does not use native `<select>` |
| **Typeahead Autocomplete** | `.oxd-input-group:has(label:text-is("<Label>")) input[placeholder="Type for hints..."]` -> wait for `Searching....` to disappear -> `[role="option"]` | Requires clicking an option from `[role="listbox"]` |
| **Date Picker** | `.oxd-input-group:has(label:text-is("<Label>")) input` (`placeholder="yyyy-dd-mm"` on live demo) | Dynamically read `placeholder` before formatting |
| **Delete Confirmation Modal** | `[role="document"]` / `.orangehrm-modal-footer` -> `getByRole('button', { name: 'Yes, Delete' })` | Required for all UI record cleanups |

## 3. Module PRD Index
1. [auth.md](file:///D:/Work/Automation%20Projects/Playwright/orangehrm-bdd-playwright/docs/prd/auth.md) — `REQ-AUTH-01` .. `REQ-AUTH-05`
2. [dashboard.md](file:///D:/Work/Automation%20Projects/Playwright/orangehrm-bdd-playwright/docs/prd/dashboard.md) — `REQ-DASH-01` .. `REQ-DASH-04`
3. [pim.md](file:///D:/Work/Automation%20Projects/Playwright/orangehrm-bdd-playwright/docs/prd/pim.md) — `REQ-PIM-01` .. `REQ-PIM-05`
4. [admin.md](file:///D:/Work/Automation%20Projects/Playwright/orangehrm-bdd-playwright/docs/prd/admin.md) — `REQ-ADM-01` .. `REQ-ADM-05`
5. [leave.md](file:///D:/Work/Automation%20Projects/Playwright/orangehrm-bdd-playwright/docs/prd/leave.md) — `REQ-LVE-01` .. `REQ-LVE-04`
6. [time.md](file:///D:/Work/Automation%20Projects/Playwright/orangehrm-bdd-playwright/docs/prd/time.md) — `REQ-TIME-01` .. `REQ-TIME-03`
7. [recruitment.md](file:///D:/Work/Automation%20Projects/Playwright/orangehrm-bdd-playwright/docs/prd/recruitment.md) — `REQ-REC-01` .. `REQ-REC-04`
8. [my-info.md](file:///D:/Work/Automation%20Projects/Playwright/orangehrm-bdd-playwright/docs/prd/my-info.md) — `REQ-MYINFO-01` .. `REQ-MYINFO-03`
