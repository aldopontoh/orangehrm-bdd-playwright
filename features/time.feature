@time
Feature: Time and Attendance
  As an HR user
  I want to inspect employee timesheets, view my weekly timesheet status, and record attendance punches
  So that workforce hours and attendance logs remain accurate

  @smoke @P0 @TC-TIME-01
  Scenario: Employee Timesheets view loads search and pending actions table
    Given I am on the Employee Timesheets page
    Then Employee Timesheets should display Select Employee search and pending actions table

  @regression @P1 @TC-TIME-02
  Scenario: My Timesheet displays current weekly period and submission status
    Given I am on the My Timesheet page
    Then My Timesheet should display the current weekly period and submission status

  @regression @P1 @TC-TIME-03
  Scenario: Attendance Punch In and Punch Out toggles state cleanly with a note
    Given I am on the Attendance Punch page
    When I submit an attendance punch with note "AutoQA Attendance Check"
    Then the attendance state should save and toggle to the opposite punch action
