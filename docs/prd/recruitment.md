# PRD: Recruitment Management (`recruitment`)

## 1. Module Overview, Business Objective & Risk Priority
- **Business Objective**: Support end-to-end talent acquisition workflows including candidate intake with resume uploads, candidate validation, pipeline search/cleanup, and vacancy management.
- **Risk Priority**: **Medium (P0/P1)**

## 2. Entry Points, Routes & Role Preconditions
- **Routes**:
  - Candidates List: `/web/index.php/recruitment/viewCandidates`
  - Add Candidate: `/web/index.php/recruitment/addCandidate`
  - Vacancies List: `/web/index.php/recruitment/viewJobVacancy`
  - Add Vacancy: `/web/index.php/recruitment/addJobVacancy`
- **Role Preconditions**: Authenticated `Admin` session. All test candidates MUST be prefixed with `AutoQA_` and cleaned up in the `After` hook.

## 3. Atomic Functional Requirements
- **REQ-REC-01**: Recruiters shall be able to add a new candidate (`AutoQA_*` First/Last Name, valid Email, Contact Number, optional `.txt` resume upload via `input[type="file"]`, and Consent checkbox), receiving a `"Successfully Saved"` toast and redirecting to the Candidate Profile (`Application Stage`).
- **REQ-REC-02**: Add Candidate shall enforce required First Name, Last Name, and Email fields (`"Required"`) and reject malformed email addresses (`"Expected format: admin@example.com"`).
- **REQ-REC-03**: Recruiters shall be able to search the Candidates list by `Candidate Name` autocomplete (`Type for hints...`), verify the `AutoQA_*` candidate row, and delete the candidate via the row trash button and `"Yes, Delete"` confirmation modal.
- **REQ-REC-04**: Recruiters shall be able to navigate to the `Vacancies` tab (`/recruitment/viewJobVacancy`), inspect the Vacancies search grid (`Job Title`, `Vacancy`, `Hiring Manager`, `Status`), and open the `Add Vacancy` form with required controls (`Vacancy Name`, `Job Title`, `Hiring Manager`, `Number of Positions`).

## 4. Verified UI Inventory & Resilient Locators
| Element | Verified Semantic Locator |
| --- | --- |
| Recruitment / Candidates Headings | `page.getByRole('heading', { name: 'Candidates', level: 5 })`, `page.getByRole('heading', { name: 'Add Candidate', level: 6 })` |
| Vacancies Headings | `page.getByRole('heading', { name: 'Vacancies', level: 5 })`, `page.getByRole('heading', { name: 'Add Vacancy', level: 6 })` |
| Topbar Tabs | `page.getByRole('link', { name: 'Candidates' \| 'Vacancies' })` |
| Candidate Name Inputs | `page.getByPlaceholder('First Name')`, `page.getByPlaceholder('Middle Name')`, `page.getByPlaceholder('Last Name')` |
| Email / Contact Number | `.oxd-input-group:has(label:text-is("Email")) input`, `.oxd-input-group:has(label:text-is("Contact Number")) input` |
| Resume Upload Input | `page.locator('input[type="file"]')` |
| Keywords / Notes | `page.getByPlaceholder('Enter comma seperated words...')`, `.oxd-input-group:has(label:text-is("Notes")) textarea` |
| Consent Checkbox | `.oxd-checkbox-input` |
| Save / Add / Search / Reset | `page.getByRole('button', { name: 'Save' \| 'Add' \| 'Search' \| 'Reset' })` |

## 5. Validation Rules, Boundary Conditions & Timing
- **Live DOM Finding**: Pre-seeded Vacancies may be empty (`No Records Found`) on the shared demo sandbox. Candidate intake (REQ-REC-01) must work even when `Vacancy` is unselected or dynamically selects an active vacancy only if present.
- Resume upload accepts `.docx`, `.doc`, `.odt`, `.pdf`, `.rtf`, `.txt` up to 1MB; use an in-memory `.txt` buffer via Playwright `setInputFiles({ name, mimeType, buffer })` so no temp disk files leak.

## 6. Testable Acceptance Criteria
- **Given** an Admin opens Add Candidate, **When** valid `AutoQA_*` details and a `.txt` resume are submitted, **Then** `"Successfully Saved"` toast appears and the Candidate Profile renders with `Application Stage`.
- **Given** an Admin submits Add Candidate with `"invalid-email"`, **Then** inline error `"Expected format: admin@example.com"` is displayed.
