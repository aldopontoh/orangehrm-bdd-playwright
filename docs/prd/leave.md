# PRD: Leave Management (`leave`)

## 1. Module Overview, Business Objective & Risk Priority
- **Business Objective**: Manage employee leave entitlements, leave assignments/applications, leave approval/cancellation state transitions, and date-range filtering across the HR organization.
- **Risk Priority**: **High (P0/P1)**

## 2. Entry Points, Routes & Role Preconditions
- **Routes**:
  - Leave List: `/web/index.php/leave/viewLeaveList`
  - Add Leave Entitlement: `/web/index.php/leave/addLeaveEntitlement`
  - Assign Leave: `/web/index.php/leave/assignLeave`
  - Apply Leave: `/web/index.php/leave/applyLeave`
- **Role Preconditions**: Authenticated `Admin` session. All entitlement and leave assignment mutations MUST target a freshly created `AutoQA_*` employee cleaned up after test execution.

## 3. Atomic Functional Requirements
- **REQ-LVE-01**: Leave List shall display default leave status filter chip (`Pending Approval`), date filters (`From Date`, `To Date`), `Leave Type`, `Employee Name`, and `Sub Unit`, and support filtering and resetting results cleanly.
- **REQ-LVE-02**: Admins shall be able to add an individual Leave Entitlement (e.g., 10 days) for an `AutoQA_*` employee via `/leave/addLeaveEntitlement`, confirming the entitlement modal (`Confirm`) and receiving a `"Successfully Saved"` toast.
- **REQ-LVE-03**: Admins shall be able to assign leave to an entitled `AutoQA_*` employee via `/leave/assignLeave`, verify the scheduled leave entry in Leave List (filtered by `Scheduled` status + employee), and cancel the leave cleanly via row actions.
- **REQ-LVE-04**: Assign Leave shall enforce required fields (`Employee Name`, `Leave Type`, `From Date`, `To Date`) and reject inverted date ranges where `To Date` is earlier than `From Date` (`"To date should be after from date"`).

## 4. Verified UI Inventory & Resilient Locators
| Element | Verified Semantic Locator |
| --- | --- |
| Leave / Leave List Headings | `page.getByRole('heading', { name: 'Leave', level: 6 })`, `page.getByRole('heading', { name: 'Leave List', level: 5 })` |
| Topbar Nav Items | `page.getByRole('link', { name: 'Assign Leave' \| 'Leave List' \| 'Apply' })`, `Entitlements` dropdown |
| Status Filter Chips | `.oxd-chip` (e.g., `Pending Approval`, `Scheduled`) |
| Date Inputs | `.oxd-input-group:has(label:text-is("From Date")) input`, `.oxd-input-group:has(label:text-is("To Date")) input` |
| Leave Type / Leave Period | `.oxd-input-group:has(label:text-is("Leave Type")) .oxd-select-text` |
| Entitlement Input | `.oxd-input-group:has(label:text-is("Entitlement")) input` |
| Comments Textarea | `.oxd-input-group:has(label:text-is("Comments")) textarea` |
| Action Buttons | `page.getByRole('button', { name: 'Search' \| 'Reset' \| 'Save' \| 'Assign' \| 'Confirm' })` |

## 5. Validation Rules, Boundary Conditions & Timing
- **CRITICAL Live DOM Finding**: The OrangeHRM demo configures date inputs with `placeholder="yyyy-dd-mm"` (e.g., `2026-26-11`), though sandbox resets may switch to `yyyy-mm-dd`. Helpers MUST read the live `placeholder` attribute before formatting dates.
- Selecting a `Leave Type` dynamically fetches the employee's `Leave Balance`; wait for spinner/request completion before submitting.
- Assign Leave triggers a confirmation dialog (`Confirm Leave Assignment` -> `Ok`) if leave balance is insufficient; provisioning a 10-day entitlement first avoids overdraft prompts.

## 6. Testable Acceptance Criteria
- **Given** an `AutoQA_*` employee has a 10-day leave entitlement, **When** an Admin assigns 1 weekday of leave, **Then** `"Successfully Saved"` toast appears and the leave entry is visible in Leave List under `Scheduled` status.
- **Given** an Admin enters `To Date` earlier than `From Date` on Assign Leave, **When** the form validates, **Then** inline error `"To date should be after from date"` is displayed.
