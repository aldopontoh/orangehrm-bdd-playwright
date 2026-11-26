# PRD: PIM — Employee Lifecycle Management (`pim`)

## 1. Module Overview, Business Objective & Risk Priority
- **Business Objective**: Enable HR administrators to onboard new employees, search and filter the organizational directory, maintain employee Personal and Job records, and safely delete test/offboarded records.
- **Risk Priority**: **High (P0/P1)**

## 2. Entry Points, Routes & Role Preconditions
- **Routes**:
  - Employee List: `/web/index.php/pim/viewEmployeeList`
  - Add Employee: `/web/index.php/pim/addEmployee`
  - Personal Details: `/web/index.php/pim/viewPersonalDetails/empNumber/<id>`
  - Job Details: `/web/index.php/pim/viewJobDetails/empNumber/<id>`
- **Role Preconditions**: Authenticated `Admin` session. All CRUD operations MUST use `AutoQA_*` prefixed employee records and delete them after completion.

## 3. Atomic Functional Requirements
- **REQ-PIM-01**: HR Admins shall be able to add a new employee via `/pim/addEmployee` with First Name, optional Middle Name, Last Name, and a unique Employee ID, receiving a `"Successfully Saved"` toast and redirecting to the new employee's `Personal Details` view.
- **REQ-PIM-02**: HR Admins shall be able to search the Employee List by `Employee Id` or `Employee Name` autocomplete (`Type for hints...`), view matching rows in `.oxd-table-card`, and clear search criteria using `Reset`.
- **REQ-PIM-03**: HR Admins shall be able to update an `AutoQA_*` employee's Personal Details (e.g., `Other Id` and `Marital Status` OXD dropdown) and `Job` tab fields (e.g., `Joined Date`), persisting changes with a `"Successfully Updated"` toast.
- **REQ-PIM-04**: The Add Employee form shall enforce required First Name and Last Name validation (`"Required"`) and reject names exceeding the 30-character maximum boundary (`"Should not exceed 30 characters"`).
- **REQ-PIM-05**: HR Admins shall be able to delete an `AutoQA_*` employee from the Employee List via the row trash icon and `"Yes, Delete"` confirmation modal, receiving a `"Successfully Deleted"` toast and removing the record from subsequent searches.

## 4. Verified UI Inventory & Resilient Locators
| Element | Verified Semantic Locator |
| --- | --- |
| PIM Heading | `page.getByRole('heading', { name: 'PIM', level: 6 })` |
| Employee Information Heading | `page.getByRole('heading', { name: 'Employee Information', level: 5 })` |
| Add Employee Button / Tab | `page.getByRole('button', { name: 'Add' })` / `page.getByRole('link', { name: 'Add Employee' })` |
| First / Middle / Last Name | `page.getByPlaceholder('First Name')`, `page.getByPlaceholder('Middle Name')`, `page.getByPlaceholder('Last Name')` |
| Employee Id Input | `.oxd-input-group:has(label:text-is("Employee Id")) input` |
| Create Login Details Toggle | `.oxd-switch-input` |
| Save / Cancel / Search / Reset | `page.getByRole('button', { name: 'Save' \| 'Cancel' \| 'Search' \| 'Reset' })` |
| Employee Profile Tabs | `page.getByRole('link', { name: 'Personal Details' \| 'Job' })` |
| Table Rows & Delete Action | `.oxd-table-card`, row `button:has(.bi-trash)`, modal `getByRole('button', { name: 'Yes, Delete' })` |

## 5. Validation Rules, Boundary Conditions & Timing
- First Name & Last Name: required; max length 30 chars (`"Should not exceed 30 characters"`).
- Employee Id: max length 10 chars; auto-populated with a 4-digit sequence on load, must be cleared and replaced with a collision-free ID.
- Wait for `.oxd-loading-spinner` and `.oxd-form-loader` to disappear before interacting with Personal Details or Job tabs.

## 6. Testable Acceptance Criteria
- **Given** an Admin is on Add Employee, **When** valid `AutoQA_*` names and unique Employee Id are saved, **Then** `"Successfully Saved"` toast appears and the Personal Details page loads for the new employee.
- **Given** an `AutoQA_*` employee exists, **When** the Admin deletes the employee from Employee List and confirms `"Yes, Delete"`, **Then** `"Successfully Deleted"` appears and searching by Employee Id yields `"No Records Found"`.
