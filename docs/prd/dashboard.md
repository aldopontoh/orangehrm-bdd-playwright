# PRD: Dashboard & Global Shell (`dashboard`)

## 1. Module Overview, Business Objective & Risk Priority
- **Business Objective**: Provide authenticated HR users with a reliable global navigation shell (side panel, live menu search, collapse toggle, topbar user menu) and real-time HR operational widgets on the Dashboard home view.
- **Risk Priority**: **Medium (P0 for shell/widgets, P1/P2 for navigation controls)**

## 2. Entry Points, Routes & Role Preconditions
- **Route**: `/web/index.php/dashboard/index`
- **Role Preconditions**: Authenticated `Admin` session (`storageState`).

## 3. Atomic Functional Requirements
- **REQ-DASH-01**: Upon loading the Dashboard, the system shall render the core HR widgets: `Time at Work`, `My Actions`, `Quick Launch`, `Buzz Latest Posts`, `Employee Distribution by Sub Unit`, and `Employee Distribution by Location`.
- **REQ-DASH-02**: Typing a keyword (e.g., `PIM` or `Leave`) into the side-navigation `Search` input shall dynamically filter visible side-menu links to matching modules, and clearing the input shall restore all navigation items.
- **REQ-DASH-03**: Clicking the side-navigation collapse/expand chevron button (`.oxd-main-menu-button`) shall toggle the side panel between collapsed (`aside.oxd-sidepanel.toggled`) and expanded states.
- **REQ-DASH-04**: Clicking Quick Launch shortcut buttons (`Assign Leave`, `Leave List`, `My Timesheet`) shall navigate directly to the corresponding HR module routes, and opening the Topbar user profile menu shall display `About`, `Support`, `Change Password`, and `Logout`.

## 4. Verified UI Inventory & Resilient Locators
| Element | Verified Semantic Locator |
| --- | --- |
| Dashboard Module Heading | `page.getByRole('heading', { name: 'Dashboard', level: 6 })` |
| Sidepanel Navigation | `page.getByRole('navigation', { name: 'Sidepanel' })` |
| Sidepanel Container | `page.locator('aside.oxd-sidepanel')` |
| Side Menu Search Input | `page.getByPlaceholder('Search')` |
| Side Menu Links | `page.locator('.oxd-main-menu-item')` |
| Side Menu Toggle Button | `page.locator('.oxd-main-menu-button')` |
| Widget Titles | `page.locator('.orangehrm-dashboard-widget-name')` |
| Quick Launch Buttons | `page.getByRole('button', { name: 'Assign Leave' })`, `page.getByRole('button', { name: 'Leave List' })`, `page.getByRole('button', { name: 'My Timesheet' })` |
| User Profile Dropdown | `page.locator('.oxd-userdropdown-tab')` and `.oxd-userdropdown-name` |
| User Menu Items | `page.getByRole('menuitem', { name: 'About' \| 'Support' \| 'Change Password' \| 'Logout' })` |

## 5. Validation Rules, Boundary Conditions & Timing
- Widget cards load asynchronously via XHR; wait for `.oxd-loading-spinner` to detach before asserting widget content.
- Because the public sandbox allows other visitors to edit the Admin employee's name, assert `.oxd-userdropdown-name` is visible and non-empty rather than matching a static name.

## 6. Testable Acceptance Criteria
- **Given** an authenticated Admin is on the Dashboard, **When** widgets finish loading, **Then** all 6 core HR widgets are visible.
- **Given** an authenticated Admin types `"PIM"` into the side-menu Search field, **When** the menu filters, **Then** only `"PIM"` remains visible until the search box is cleared.
- **Given** an authenticated Admin clicks Quick Launch `"Assign Leave"`, **When** navigation completes, **Then** the browser reaches `/web/index.php/leave/assignLeave`.
