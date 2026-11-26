@leave
Feature: Leave Management
  As an HR administrator
  I want to manage leave lists, employee entitlements, leave assignments, and date validations
  So that employee time-off records follow accurate balances and status transitions

  @smoke @P0 @TC-LVE-01
  Scenario: Leave List displays default Pending Approval chip and filters cleanly
    Given I am on the Leave List page
    Then Leave List should display the default "Pending Approval" status chip and filter cleanly

  @regression @P1 @leave @employee @TC-LVE-02
  Scenario: Add Leave Entitlement for an AutoQA employee
    Given a newly created AutoQA employee exists in PIM
    When I add a 10-day Leave Entitlement for the AutoQA employee
    Then the Leave Entitlement should be saved successfully

  @regression @P0 @leave @employee @TC-LVE-03
  Scenario: Assign Leave to an entitled AutoQA employee and cancel leave cleanly
    Given a newly created AutoQA employee exists in PIM
    When I add a 10-day Leave Entitlement for the AutoQA employee
    And I assign a future weekday of leave to the entitled AutoQA employee
    Then the assigned leave should appear in Leave List and cancel cleanly

  @regression @P1 @TC-LVE-04
  Scenario: Assign Leave validates required fields and rejects inverted date ranges
    Given I am on the Assign Leave page
    When I submit Assign Leave empty and then enter an inverted date range
    Then Assign Leave should display inverted date validation "To date should be after from date"
