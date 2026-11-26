# ISTQB Test Case Matrix: Dashboard & Global Shell (`dashboard`)

**Source PRD**: [dashboard.md](../prd/dashboard.md)
**Techniques Applied**: Functional Verification, State Transition Testing, Accessibility Inspection

| Test ID | Requirement ID | Priority | Test Type | Preconditions | Test Steps | Test Data | Expected Result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **TC-DASH-01** | `REQ-DASH-01` | P0 | Positive / Accessibility | Authenticated Admin (`storageState`) | 1. Navigate to `/web/index.php/dashboard/index`.<br>2. Wait for loading spinners to disappear.<br>3. Verify page `<title>`, `Dashboard` heading, and core HR widgets. | None | All 6 core widgets (`Time at Work`, `My Actions`, `Quick Launch`, `Buzz Latest Posts`, `Employee Distribution by Sub Unit`, `Employee Distribution by Location`) are visible. |
| **TC-DASH-02** | `REQ-DASH-02` | P1 | Functional / Boundary | Authenticated Admin on Dashboard | 1. Type `"PIM"` into Sidepanel `Search` box.<br>2. Verify filtered menu shows `"PIM"` and hides unrelated modules.<br>3. Clear Search box and verify full menu restores. | Filter keyword: `"PIM"` | Sidepanel filters to 1 matching link (`PIM`) and restores >= 10 menu items upon clearing. |
| **TC-DASH-03** | `REQ-DASH-03` | P2 | State Transition (UI Shell) | Authenticated Admin on Dashboard | 1. Verify `aside.oxd-sidepanel` is expanded.<br>2. Click `.oxd-main-menu-button` to collapse.<br>3. Click `.oxd-main-menu-button` again to expand. | None | Sidepanel toggles `toggled` CSS state deterministically on collapse and removes it on expand. |
| **TC-DASH-04** | `REQ-DASH-04` | P0 | Positive (Navigation) | Authenticated Admin on Dashboard | 1. Open Topbar user dropdown and verify `About`, `Support`, `Change Password`, `Logout` menu items.<br>2. Click Quick Launch `"Assign Leave"` button.<br>3. Return to Dashboard and click `"Leave List"`. | Quick Launch targets: `Assign Leave`, `Leave List` | Topbar menu exposes all 4 items; Quick Launch buttons route to `/leave/assignLeave` and `/leave/viewLeaveList`. |
