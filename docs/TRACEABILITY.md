# Master Requirements Traceability Matrix (`TRACEABILITY.md`)

**Project**: OrangeHRM OS 5.9 Enterprise HRIS (`orangehrm-bdd-playwright`)
**Total Requirements**: 33 | **Total Test Cases**: 33 | **Total BDD Scenarios**: 33 | **Coverage**: **100%**

| Module | Requirement ID | Test Case ID | Feature File | Priority | Suite Tags | Summary |
| --- | --- | --- | --- | --- | --- | --- |
| `auth` | `REQ-AUTH-01` | `TC-AUTH-01` | `features/auth.feature` | P0 | `@auth @smoke @P0 @guest` | Valid Admin login redirects to Dashboard |
| `auth` | `REQ-AUTH-02` | `TC-AUTH-02` | `features/auth.feature` | P0 | `@auth @smoke @P0 @guest` | Invalid password displays Invalid credentials alert |
| `auth` | `REQ-AUTH-03` | `TC-AUTH-03` | `features/auth.feature` | P1 | `@auth @regression @P1 @guest` | Empty login fields trigger inline Required validation |
| `auth` | `REQ-AUTH-04` | `TC-AUTH-04` | `features/auth.feature` | P0 | `@auth @smoke @P0 @guest` | Logout invalidates session and blocks back/direct access |
| `auth` | `REQ-AUTH-05` | `TC-AUTH-05` | `features/auth.feature` | P2 | `@auth @regression @P2 @guest` | Login accessibility, CSRF token, and Forgot Password flow |
| `dashboard` | `REQ-DASH-01` | `TC-DASH-01` | `features/dashboard.feature` | P0 | `@dashboard @smoke @P0` | Dashboard loads all 6 core HR widgets |
| `dashboard` | `REQ-DASH-02` | `TC-DASH-02` | `features/dashboard.feature` | P1 | `@dashboard @regression @P1` | Side-navigation search filters and restores links |
| `dashboard` | `REQ-DASH-03` | `TC-DASH-03` | `features/dashboard.feature` | P2 | `@dashboard @regression @P2` | Side-navigation collapse/expand toggles panel state |
| `dashboard` | `REQ-DASH-04` | `TC-DASH-04` | `features/dashboard.feature` | P0 | `@dashboard @smoke @P0` | Quick Launch shortcuts and Topbar user dropdown menu |
| `pim` | `REQ-PIM-01` | `TC-PIM-01` | `features/pim.feature` | P0 | `@pim @smoke @P0 @employee` | Add AutoQA employee and redirect to Personal Details |
| `pim` | `REQ-PIM-02` | `TC-PIM-02` | `features/pim.feature` | P1 | `@pim @regression @P1 @employee` | Search Employee List by Employee ID and reset filter |
| `pim` | `REQ-PIM-03` | `TC-PIM-03` | `features/pim.feature` | P1 | `@pim @regression @P1 @employee` | Update Personal Details and inspect Job tab persistence |
| `pim` | `REQ-PIM-04` | `TC-PIM-04` | `features/pim.feature` | P1 | `@pim @regression @P1` | Add Employee required and 30-char max-length validation |
| `pim` | `REQ-PIM-05` | `TC-PIM-05` | `features/pim.feature` | P0 | `@pim @regression @P0 @employee` | Delete AutoQA employee via UI confirmation modal |
| `admin` | `REQ-ADM-01` | `TC-ADM-01` | `features/admin.feature` | P0 | `@admin @smoke @P0 @user-admin` | Search default Admin user without mutation |
| `admin` | `REQ-ADM-02` | `TC-ADM-02` | `features/admin.feature` | P0 | `@admin @regression @P0 @user-admin` | Create ESS System User linked to AutoQA employee |
| `admin` | `REQ-ADM-03` | `TC-ADM-03` | `features/admin.feature` | P1 | `@admin @regression @P1` | Add System User password length and mismatch validation |
| `admin` | `REQ-ADM-04` | `TC-ADM-04` | `features/admin.feature` | P1 | `@admin @regression @P1 @user-admin` | Edit System User status to Disabled and delete cleanly |
| `admin` | `REQ-ADM-05` | `TC-ADM-05` | `features/admin.feature` | P0 | `@admin @e2e @regression @P0 @guest @employee @user-admin` | E2E Onboarding + ESS login RBAC restriction verification |
| `leave` | `REQ-LVE-01` | `TC-LVE-01` | `features/leave.feature` | P0 | `@leave @smoke @P0` | Leave List default Pending Approval chip, search & reset |
| `leave` | `REQ-LVE-02` | `TC-LVE-02` | `features/leave.feature` | P1 | `@leave @regression @P1 @leave` | Add 10-day Leave Entitlement for AutoQA employee |
| `leave` | `REQ-LVE-03` | `TC-LVE-03` | `features/leave.feature` | P0 | `@leave @regression @P0 @leave` | Assign Leave to entitled AutoQA employee and cancel leave |
| `leave` | `REQ-LVE-04` | `TC-LVE-04` | `features/leave.feature` | P1 | `@leave @regression @P1` | Assign Leave required fields and inverted date validation |
| `time` | `REQ-TIME-01` | `TC-TIME-01` | `features/time.feature` | P0 | `@time @smoke @P0` | Employee Timesheets search and pending table view |
| `time` | `REQ-TIME-02` | `TC-TIME-02` | `features/time.feature` | P1 | `@time @regression @P1` | My Timesheet weekly period, status, and action controls |
| `time` | `REQ-TIME-03` | `TC-TIME-03` | `features/time.feature` | P1 | `@time @regression @P1` | Attendance Punch In / Punch Out toggle with note |
| `recruitment` | `REQ-REC-01` | `TC-REC-01` | `features/recruitment.feature` | P0 | `@recruitment @smoke @P0 @recruitment` | Add AutoQA Candidate with resume upload |
| `recruitment` | `REQ-REC-02` | `TC-REC-02` | `features/recruitment.feature` | P1 | `@recruitment @regression @P1` | Add Candidate required fields and invalid email validation |
| `recruitment` | `REQ-REC-03` | `TC-REC-03` | `features/recruitment.feature` | P1 | `@recruitment @regression @P1 @recruitment` | Search Candidates list and delete AutoQA candidate |
| `recruitment` | `REQ-REC-04` | `TC-REC-04` | `features/recruitment.feature` | P1 | `@recruitment @regression @P1 @recruitment` | Vacancies grid and Add Vacancy form controls |
| `my-info` | `REQ-MYINFO-01` | `TC-MYINFO-01` | `features/my-info.feature` | P0 | `@my-info @smoke @P0` | My Info Personal Details and self-service navigation tabs |
| `my-info` | `REQ-MYINFO-02` | `TC-MYINFO-02` | `features/my-info.feature` | P1 | `@my-info @regression @P1` | Contact Details sections and malformed Work Email validation |
| `my-info` | `REQ-MYINFO-03` | `TC-MYINFO-03` | `features/my-info.feature` | P1 | `@my-info @regression @P1` | Emergency Contacts table and required form validation |

## Coverage Summary
- **Total Requirements (`REQ-*`)**: 33
- **Total Test Cases (`TC-*`)**: 33
- **Total BDD Scenarios (`@TC-*`)**: 33
- **`@smoke` (P0 Critical Paths across all 8 modules)**: 11 (`TC-AUTH-01`, `TC-AUTH-02`, `TC-AUTH-04`, `TC-DASH-01`, `TC-DASH-04`, `TC-PIM-01`, `TC-ADM-01`, `TC-LVE-01`, `TC-TIME-01`, `TC-REC-01`, `TC-MYINFO-01`)
- **`@regression` (Functional, Validation, BVA, State Transition, CRUD, Accessibility)**: 22
- **`@e2e` (Cross-Module HRIS Onboarding -> ESS RBAC Journey)**: 1 (`TC-ADM-05`)
