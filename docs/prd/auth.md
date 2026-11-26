# PRD: Authentication & Session Management (`auth`)

## 1. Module Overview, Business Objective & Risk Priority
- **Business Objective**: Protect all HRIS employee PII and administrative controls behind CSRF-protected session authentication, strict credential validation, and complete server-side session revocation upon logout.
- **Risk Priority**: **Critical (P0)**

## 2. Entry Points, Routes & Role Preconditions
- **Routes**:
  - Login: `/web/index.php/auth/login`
  - Forgot Password: `/web/index.php/auth/requestPasswordResetCode`
  - Logout endpoint: `/web/index.php/auth/logout`
  - Post-login landing: `/web/index.php/dashboard/index`
- **Role Preconditions**: `Guest` (unauthenticated browser context with cleared cookies so shared `storageState` is never invalidated).

## 3. Atomic Functional Requirements
- **REQ-AUTH-01**: Valid `Admin` credentials submitted via the Login form shall authenticate the user, establish an `orangehrm` session cookie, and redirect to `/web/index.php/dashboard/index` displaying the `Dashboard` heading.
- **REQ-AUTH-02**: Submitting an invalid password or unknown username shall block authentication, keep the user on `/web/index.php/auth/login`, and render an error alert (`role="alert"`) displaying `"Invalid credentials"`.
- **REQ-AUTH-03**: Submitting the Login form with empty Username and/or Password shall prevent submission and render inline `"Required"` validation messages under each blank field.
- **REQ-AUTH-04**: Selecting `Logout` from the topbar user menu shall invalidate the server session, redirect to `/web/index.php/auth/login`, and block re-entry via browser Back navigation or direct navigation to `/web/index.php/dashboard/index`.
- **REQ-AUTH-05**: The Login page shall expose accessible document metadata (`<title>OrangeHRM</title>`), semantic heading (`h5: "Login"`), a non-empty hidden CSRF token (`input[name="_token"]`), and a functional `"Forgot your password?"` link routing to `/web/index.php/auth/requestPasswordResetCode` (`h6: "Reset Password"`).

## 4. Verified UI Inventory & Resilient Locators
| Element | Verified Semantic Locator |
| --- | --- |
| Login Heading | `page.getByRole('heading', { name: 'Login', level: 5 })` |
| Username Input | `page.getByPlaceholder('Username')` (`input[name="username"]`) |
| Password Input | `page.getByPlaceholder('Password')` (`input[name="password"]`) |
| Login Submit Button | `page.getByRole('button', { name: 'Login' })` |
| CSRF Token | `page.locator('input[name="_token"]')` |
| Invalid Credentials Alert | `page.getByRole('alert')` (`.oxd-alert--error`, text `"Invalid credentials"`) |
| Inline Field Errors | `page.locator('.oxd-input-field-error-message')` (text `"Required"`) |
| Forgot Password Link | `page.getByText('Forgot your password?')` |
| Reset Password Heading | `page.getByRole('heading', { name: 'Reset Password', level: 6 })` |
| Topbar User Dropdown | `page.locator('.oxd-userdropdown-tab')` |
| Logout Menu Item | `page.getByRole('menuitem', { name: 'Logout' })` |

## 5. Validation Rules, Boundary Conditions & Timing
- Empty username + empty password -> 2 `"Required"` inline messages.
- Valid username + wrong password -> server round-trip returns `/auth/login` with `role="alert"` `"Invalid credentials"`.
- Logout destroys PHP session cookie; navigating back or directly to `/dashboard/index` immediately redirects to `/auth/login`.

## 6. Testable Acceptance Criteria
- **Given** a guest user is on `/web/index.php/auth/login`, **When** valid Admin credentials are submitted, **Then** the browser navigates to `/web/index.php/dashboard/index` and displays the `Dashboard` heading.
- **Given** a guest user is on `/web/index.php/auth/login`, **When** an invalid password is submitted, **Then** the `"Invalid credentials"` alert is visible and the URL remains `/auth/login`.
- **Given** an authenticated user clicks `Logout`, **When** the user clicks browser Back or visits `/dashboard/index`, **Then** the app redirects back to `/auth/login`.
