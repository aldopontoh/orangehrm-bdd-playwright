@my-info
Feature: My Info Employee Self-Service
  As an OrangeHRM employee
  I want to access my personal, contact, and emergency contact details with strict input validation
  So that self-service profile updates protect data integrity without corrupting records

  Background:
    Given I am on the My Info Personal Details page

  @smoke @P0 @TC-MYINFO-01
  Scenario: My Info Personal Details loads profile shell and self-service tabs
    Then My Info should display Personal Details and self-service profile tabs

  @regression @P1 @TC-MYINFO-02
  Scenario: Contact Details validates malformed Work Email without saving corrupt data
    When I open Contact Details and enter malformed Work Email "not-a-valid-email"
    Then Contact Details should display inline validation "Expected format: admin@example.com"

  @regression @P1 @TC-MYINFO-03
  Scenario: Emergency Contacts enforces required fields on blank submission
    When I open Emergency Contacts and submit the Add form with blank required fields
    Then Emergency Contacts should display inline "Required" validation and cancel cleanly
