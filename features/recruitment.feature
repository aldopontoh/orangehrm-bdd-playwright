@recruitment
Feature: Recruitment Management
  As an HR recruiter
  I want to add and validate candidates with resumes, manage candidate cleanup, and inspect vacancies
  So that hiring workflows remain organized and test data never pollutes the sandbox

  @smoke @P0 @recruitment @TC-REC-01
  Scenario: Add a new AutoQA candidate with resume attachment
    Given I am on the Recruitment Add Candidate page
    When I add a new AutoQA candidate with a resume attachment
    Then the AutoQA candidate profile should open in Application Stage

  @regression @P1 @TC-REC-02
  Scenario: Add Candidate enforces required fields and email format validation
    Given I am on the Recruitment Add Candidate page
    When I submit Add Candidate blank and then enter an invalid email "invalid-email-format"
    Then Add Candidate should display email format error "Expected format: admin@example.com"

  @regression @P1 @recruitment @TC-REC-03
  Scenario: Search Candidates list and delete AutoQA candidate cleanly
    Given a newly created AutoQA candidate exists in Recruitment
    When I search Candidates and delete the AutoQA candidate
    Then the AutoQA candidate deletion toast should confirm removal

  @regression @P1 @recruitment @TC-REC-04
  Scenario: Vacancies tab displays grid and opens Add Vacancy workflow controls
    When I navigate to the Vacancies tab and open Add Vacancy
    Then the Add Vacancy form should expose Vacancy Name, Job Title, and Hiring Manager controls
