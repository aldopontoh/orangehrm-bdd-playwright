# ISTQB Test Case Matrix: Authentication & Session Management (`auth`)

**Source PRD**: [auth.md](../prd/auth.md)
**Techniques Applied**: Equivalence Partitioning (EP), State Transition Testing, Error Guessing, Accessibility Inspection

| Test ID | Requirement ID | Priority | Test Type | Preconditions | Test Steps | Test Data | Expected Result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **TC-AUTH-01** | `REQ-AUTH-01` | P0 | Positive (Happy Path / EP) | Guest browser context with cleared cookies | 1. Navigate to `/web/index.php/auth/login`.<br>2. Fill `Username` and `Password` from environment variables.<br>3. Click `Login`. | Valid `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Browser redirects to `/web/index.php/dashboard/index`; `Dashboard` H6 heading and user profile dropdown are visible. |
| **TC-AUTH-02** | `REQ-AUTH-02` | P0 | Negative (EP / Error Guessing) | Guest browser context on `/auth/login` | 1. Enter valid `ADMIN_USERNAME` and invalid password `WrongPassword!99`.<br>2. Click `Login`. | Username: `Admin`, Password: `WrongPassword!99` | URL remains `/web/index.php/auth/login`; `role="alert"` displays `"Invalid credentials"`. |
| **TC-AUTH-03** | `REQ-AUTH-03` | P1 | Negative / Input Validation (BVA) | Guest browser context on `/auth/login` | 1. Leave `Username` and `Password` empty.<br>2. Click `Login`. | Username: `""`, Password: `""` | Two `.oxd-input-field-error-message` labels display `"Required"`; no redirect occurs. |
| **TC-AUTH-04** | `REQ-AUTH-04` | P0 | State Transition / Security | Isolated authenticated session (not shared `storageState`) | 1. Log in as Admin on a fresh cookie-cleared context.<br>2. Open Topbar user dropdown and click `Logout`.<br>3. Attempt browser Back and direct navigation to `/web/index.php/dashboard/index`. | Valid Admin credentials | User is redirected to `/web/index.php/auth/login` after logout and blocked from re-entering `/dashboard/index`. |
| **TC-AUTH-05** | `REQ-AUTH-05` | P2 | Accessibility & Secondary Flow | Guest browser context on `/auth/login` | 1. Verify document `<title>` is `OrangeHRM`, `h5` heading is `Login`, and hidden `input[name="_token"]` is non-empty.<br>2. Click `"Forgot your password?"`.<br>3. Verify `Reset Password` H6 heading and `Cancel` returns to Login. | None | Accessible title, heading, CSRF token verified; Forgot Password route renders `Reset Password` form cleanly. |
