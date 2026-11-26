@admin
Feature: Admin User and RBAC Management
  As a system administrator
  I want to manage system user accounts, password policies, and role-based access controls
  So that privileged Admin capabilities remain isolated from standard ESS employees

  @smoke @P0 @user-admin @TC-ADM-01
  Scenario: Search default Admin system user without mutating the account
    Given I am on the Admin System Users page
    When I search System Users for username "Admin" with role "Admin"
    Then the System Users table should list "Admin" with role "Admin" and status "Enabled"

  @regression @P0 @user-admin @employee @TC-ADM-02
  Scenario: Create a new AutoQA ESS System User linked to an AutoQA employee
    Given a newly created AutoQA employee exists in PIM
    When I create a new AutoQA ESS System User linked to the AutoQA employee
    Then the new AutoQA ESS System User should be searchable in System Users

  @regression @P1 @TC-ADM-03
  Scenario: Add System User enforces password length and confirmation mismatch rules
    Given I am on the Admin Add User page
    When I test weak password length and confirm password mismatch on Add User
    Then Add User should display password policy validation errors

  @regression @P1 @user-admin @employee @TC-ADM-04
  Scenario: Edit AutoQA System User status to Disabled and delete cleanly
    Given a newly created AutoQA employee exists in PIM
    When I create a new AutoQA ESS System User linked to the AutoQA employee
    And I update the AutoQA System User status to "Disabled" and then delete the user
    Then the AutoQA System User should be cleanly deleted

  @e2e @regression @P0 @guest @employee @user-admin @TC-ADM-05
  Scenario: Cross-module RBAC onboarding creates ESS login restricted from Admin and Maintenance
    When an Admin onboards a new AutoQA employee with ESS login details enabled
    And I switch to a clean guest session and sign in as the new AutoQA ESS user
    Then the ESS user should reach the Dashboard without access to Admin or Maintenance modules
