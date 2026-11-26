# ISTQB Test Case Matrix: Time & Attendance (`time`)

**Source PRD**: [time.md](../prd/time.md)
**Techniques Applied**: Functional Verification, State Transition Testing (`Punch In <-> Punch Out`)

| Test ID | Requirement ID | Priority | Test Type | Preconditions | Test Steps | Test Data | Expected Result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **TC-TIME-01** | `REQ-TIME-01` | P0 | Positive (Smoke / Shell) | Authenticated Admin (`storageState`) | 1. Navigate to `/web/index.php/time/viewEmployeeTimesheet`.<br>2. Verify `Select Employee` heading, `Type for hints...` autocomplete input, `View` button, and `Timesheets Pending Action` table headers. | None | Employee Timesheets view renders all search and pending-action columns cleanly. |
| **TC-TIME-02** | `REQ-TIME-02` | P1 | Positive (Timesheet State) | Authenticated Admin (`storageState`) | 1. Navigate to `/web/index.php/time/viewMyTimesheet`.<br>2. Wait for spinner to disappear.<br>3. Verify `My Timesheet` heading, active weekly period input, and timesheet status footer (`Status: ...`). | Current week period | My Timesheet displays current week range, non-empty submission status, and valid action buttons. |
| **TC-TIME-03** | `REQ-TIME-03` | P1 | State Transition (`In <-> Out`) | Authenticated Admin (`storageState`) | 1. Navigate to `/web/index.php/attendance/punchIn`.<br>2. Read current state heading (`Punch In` or `Punch Out`).<br>3. Enter note `"AutoQA Attendance Check"` and click the active `In` or `Out` button. | Note: `AutoQA Attendance Check` | `"Successfully Saved"` toast appears and the Punch screen transitions cleanly to the opposite attendance state (`Punch Out` or `Punch In`). |
