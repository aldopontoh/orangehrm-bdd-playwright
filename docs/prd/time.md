# PRD: Time & Attendance (`time`)

## 1. Module Overview, Business Objective & Risk Priority
- **Business Objective**: Provide employees and managers with weekly timesheet visibility/submission controls and accurate attendance Punch In / Punch Out tracking.
- **Risk Priority**: **Medium (P0/P1)**

## 2. Entry Points, Routes & Role Preconditions
- **Routes**:
  - Employee Timesheets: `/web/index.php/time/viewEmployeeTimesheet`
  - My Timesheet: `/web/index.php/time/viewMyTimesheet`
  - Attendance Punch In/Out: `/web/index.php/attendance/punchIn`
- **Role Preconditions**: Authenticated `Admin` session.

## 3. Atomic Functional Requirements
- **REQ-TIME-01**: Employee Timesheets (`/time/viewEmployeeTimesheet`) shall display the `Select Employee` autocomplete search (`Type for hints...`), `View` button, and `Timesheets Pending Action` table with `Employee Name`, `Timesheet Period`, and `Actions` columns.
- **REQ-TIME-02**: My Timesheet (`/time/viewMyTimesheet`) shall display the `My Timesheet` heading, the active weekly timesheet period selector, current submission status (`Status: Not Submitted` / `Status: Submitted` / `Status: Approved`), and valid workflow action buttons (`Edit`, `Submit`, or `Create Timesheet`).
- **REQ-TIME-03**: Attendance Punch In / Punch Out (`/attendance/punchIn`) shall display the active attendance action (`Punch In` with button `In`, or `Punch Out` with button `Out`), pre-populated Date and Time fields, a Note textarea (`Type here`), and successfully transition attendance state with a `"Successfully Saved"` toast upon submission.

## 4. Verified UI Inventory & Resilient Locators
| Element | Verified Semantic Locator |
| --- | --- |
| Time / Timesheets Headings | `page.getByRole('heading', { name: 'Select Employee', level: 6 })`, `page.getByRole('heading', { name: 'Timesheets Pending Action', level: 6 })` |
| My Timesheet Heading | `page.getByRole('heading', { name: 'My Timesheet', level: 6 })` |
| Timesheet Period Input | `.oxd-date-input input` |
| Timesheet Status Text | `.orangehrm-timesheet-footer--title p` |
| Punch Heading | `page.getByRole('heading', { name: /Punch (In\|Out)/, level: 6 })` |
| Punch Note Textarea | `page.getByPlaceholder('Type here')` |
| Punch Action Button | `page.getByRole('button', { name: /^(In\|Out)$/ })` |

## 5. Validation Rules, Boundary Conditions & Timing
- Because the shared demo sandbox may already be `Punched In` or `Punched Out` from another session, REQ-TIME-03 must detect the live heading (`Punch In` vs. `Punch Out`), record the initial state, submit with an `AutoQA` note, and assert the state flips to the opposite heading (`Punch Out` <-> `Punch In`)!
- On Punch Out, if another user punched in with a future timestamp, ensure the Punch Out time is valid or fall back cleanly without mutating historical records.

## 6. Testable Acceptance Criteria
- **Given** an authenticated user opens `/time/viewEmployeeTimesheet`, **When** the page loads, **Then** `Select Employee` and `Timesheets Pending Action` sections are visible.
- **Given** an authenticated user opens `/attendance/punchIn`, **When** they enter an `AutoQA` note and click the active `In` or `Out` button, **Then** `"Successfully Saved"` toast appears and the Punch state toggles.
