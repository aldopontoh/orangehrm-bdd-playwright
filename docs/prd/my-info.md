# PRD: My Info — Employee Self-Service (`my-info`)

## 1. Module Overview, Business Objective & Risk Priority
- **Business Objective**: Empower employees to view and validate their own Personal Details, Contact Details, and Emergency Contacts through Employee Self-Service (ESS) with strict input validation.
- **Risk Priority**: **Medium (P0/P1)**

## 2. Entry Points, Routes & Role Preconditions
- **Routes**:
  - Personal Details: `/web/index.php/pim/viewMyDetails` -> redirects to `/web/index.php/pim/viewPersonalDetails/empNumber/<id>`
  - Contact Details: `/web/index.php/pim/contactDetails/empNumber/<id>`
  - Emergency Contacts: `/web/index.php/pim/viewEmergencyContacts/empNumber/<id>`
- **Role Preconditions**: Authenticated `Admin` session. **SAFETY GUARDRAIL**: Never permanently alter or corrupt the default Admin employee's profile details; perform non-destructive read & negative-validation checks (or cancel before save).

## 3. Atomic Functional Requirements
- **REQ-MYINFO-01**: Navigating to `My Info` shall load the employee's `Personal Details` view displaying the employee profile header, vertical self-service navigation tabs (`Personal Details`, `Contact Details`, `Emergency Contacts`, `Dependents`, `Immigration`, `Job`), and personal detail form fields (`Employee Full Name`, `Employee Id`, `Nationality`, `Marital Status`).
- **REQ-MYINFO-02**: Opening `Contact Details` shall display `Address`, `Telephone`, and `Email` sections, and entering a malformed `Work Email` (e.g., `"not-an-email"`) shall trigger inline validation (`"Expected format: admin@example.com"`) and block invalid persistence.
- **REQ-MYINFO-03**: Opening `Emergency Contacts` shall display the `Assigned Emergency Contacts` table and `Add` button; opening the Add Emergency Contact form and submitting empty required fields (`Name`, `Relationship`, and at least one telephone number) shall display inline `"Required"` validation messages.

## 4. Verified UI Inventory & Resilient Locators
| Element | Verified Semantic Locator |
| --- | --- |
| Profile Sub-Navigation Tabs | `page.getByRole('link', { name: 'Personal Details' \| 'Contact Details' \| 'Emergency Contacts' \| 'Job' })` |
| Section Headings | `page.getByRole('heading', { name: 'Personal Details' \| 'Contact Details' \| 'Assigned Emergency Contacts', level: 6 })` |
| Contact Sections | `page.getByRole('heading', { name: 'Address' \| 'Telephone' \| 'Email', level: 6 })` |
| Work Email Input | `.oxd-input-group:has(label:text-is("Work Email")) input` |
| Emergency Contact Add Button | `.orangehrm-action-header:has-text("Assigned Emergency Contacts") button` |
| Save / Cancel Buttons | `page.getByRole('button', { name: 'Save' \| 'Cancel' })` |
| Inline Error Messages | `.oxd-input-field-error-message` |

## 5. Validation Rules, Boundary Conditions & Timing
- Wait for `.oxd-form-loader` to disappear on Personal Details and Contact Details before inspecting or typing into form inputs (Vue hydrates fields asynchronously).
- Do NOT click `Save` on valid edits to the Admin user's Personal Details to preserve shared demo hygiene.

## 6. Testable Acceptance Criteria
- **Given** an authenticated user navigates to `My Info`, **When** the profile finishes loading, **Then** `Personal Details`, `Contact Details`, and `Emergency Contacts` tabs are visible.
- **Given** the user is on `Contact Details`, **When** `"invalid-email"` is entered in `Work Email`, **Then** `"Expected format: admin@example.com"` appears inline.
- **Given** the user opens Add Emergency Contact and clicks `Save` with blank fields, **Then** inline `"Required"` errors are displayed.
