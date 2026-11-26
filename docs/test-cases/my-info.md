# ISTQB Test Case Matrix: My Info — Employee Self-Service (`my-info`)

**Source PRD**: [my-info.md](../prd/my-info.md)
**Techniques Applied**: Functional Verification, Negative Input Validation, Safety-Constrained Profile Audit

| Test ID | Requirement ID | Priority | Test Type | Preconditions | Test Steps | Test Data | Expected Result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **TC-MYINFO-01** | `REQ-MYINFO-01` | P0 | Positive (Smoke / Accessibility) | Authenticated Admin (`storageState`) | 1. Navigate to `/web/index.php/pim/viewMyDetails`.<br>2. Wait for form loader to disappear.<br>3. Verify `Personal Details` heading, employee profile tabs (`Personal Details`, `Contact Details`, `Emergency Contacts`, `Job`), and form fields (`First Name`, `Last Name`, `Employee Id`). | None | Personal Details view and all self-service tabs render cleanly without mutating the Admin profile. |
| **TC-MYINFO-02** | `REQ-MYINFO-02` | P1 | Negative / Format Validation | Authenticated Admin on `My Info` | 1. Click `Contact Details` tab.<br>2. Verify `Address`, `Telephone`, and `Email` section headings.<br>3. Enter `"not-a-valid-email"` into `Work Email` (do NOT save valid edits). | Work Email: `"not-a-valid-email"` | Inline validation displays `"Expected format: admin@example.com"` and prevents invalid email persistence. |
| **TC-MYINFO-03** | `REQ-MYINFO-03` | P1 | Negative / Required Validation | Authenticated Admin on `My Info` | 1. Click `Emergency Contacts` tab.<br>2. Verify `Assigned Emergency Contacts` heading and table.<br>3. Click `Add`, then click `Save` with blank required fields, then click `Cancel`. | Blank emergency contact fields | Inline `"Required"` error messages display for blank Name/Relationship/Telephone fields; `Cancel` closes form cleanly. |
