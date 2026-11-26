@pim
Feature: PIM Employee Lifecycle Management
  As an HR administrator
  I want to onboard, search, update, validate, and safely remove test employee records
  So that employee master data remains accurate and isolated in the shared sandbox

  @smoke @P0 @employee @TC-PIM-01
  Scenario: Add a new AutoQA employee and redirect to Personal Details
    Given I am on the PIM Add Employee page
    When I add a new AutoQA employee with a unique Employee ID
    Then I should see a success toast and land on the new employee Personal Details page

  @regression @P1 @employee @TC-PIM-02
  Scenario: Search Employee List by AutoQA Employee ID and reset filter
    Given a newly created AutoQA employee exists in PIM
    When I search the Employee List by the AutoQA employee ID
    Then the Employee List should display the matching AutoQA employee row
    When I reset the PIM Employee List search filters
    Then the Employee ID search input should be cleared

  @regression @P1 @employee @TC-PIM-03
  Scenario: Update Personal Details and verify persistence across Job tab navigation
    Given a newly created AutoQA employee exists in PIM
    When I update the employee Personal Details and inspect the Job tab
    Then the updated Personal Details should persist for the AutoQA employee

  @regression @P1 @TC-PIM-04
  Scenario: Add Employee enforces required fields and 30-character name boundary
    Given I am on the PIM Add Employee page
    When I submit the Add Employee form with blank required fields
    Then Add Employee should display inline error "Required"
    When I enter a 31-character First Name on Add Employee
    Then Add Employee should display inline error "Should not exceed 30 characters"

  @regression @P0 @employee @TC-PIM-05
  Scenario: Delete an AutoQA employee via Employee List confirmation modal
    Given a newly created AutoQA employee exists in PIM
    When I delete the AutoQA employee from the Employee List
    Then the AutoQA employee should no longer appear in Employee List search results
