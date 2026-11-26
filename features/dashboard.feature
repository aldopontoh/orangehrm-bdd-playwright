@dashboard
Feature: Dashboard and Global Shell
  As an authenticated HR administrator
  I want reliable Dashboard HR widgets and responsive global shell controls
  So that I can monitor workforce status and navigate HR modules efficiently

  Background:
    Given I am on the OrangeHRM Dashboard

  @smoke @P0 @TC-DASH-01
  Scenario: Dashboard renders all core HR operational widgets
    Then the Dashboard should display all core HR operational widgets

  @regression @P1 @TC-DASH-02
  Scenario: Side navigation search filters matching modules and restores on clear
    When I filter the side navigation menu with "PIM"
    Then the side navigation menu should only display "PIM"
    When I clear the side navigation search filter
    Then the full set of side navigation modules should be restored

  @regression @P2 @TC-DASH-03
  Scenario: Side navigation panel collapses and expands cleanly
    When I collapse and then re-expand the side navigation panel
    Then the side navigation panel should toggle its collapsed state cleanly

  @smoke @P0 @TC-DASH-04
  Scenario: Topbar user profile menu and Quick Launch shortcuts route accurately
    When I inspect the topbar user profile dropdown menu
    Then all standard user profile menu actions should be visible
    When I click the "Assign Leave" Quick Launch shortcut
    Then I should navigate to a route matching "/leave/assignLeave"
