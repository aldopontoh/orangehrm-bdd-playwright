@auth
Feature: Authentication and Session Management
  As an OrangeHRM user
  I want secure session authentication, credential validation, and complete logout protection
  So that employee HRIS records remain protected from unauthorized access

  @smoke @P0 @guest @TC-AUTH-01
  Scenario: Valid Admin login redirects to Dashboard and initializes session
    Given I am on the OrangeHRM login page as a guest
    When I sign in with valid Admin credentials
    Then I should be redirected to the Dashboard with an active session

  @smoke @P0 @guest @TC-AUTH-02
  Scenario: Invalid password displays authentication error alert
    Given I am on the OrangeHRM login page as a guest
    When I sign in with username "Admin" and password "WrongPassword!99"
    Then I should see the authentication error alert "Invalid credentials"

  @regression @P1 @guest @TC-AUTH-03
  Scenario: Empty credentials trigger inline required validation messages
    Given I am on the OrangeHRM login page as a guest
    When I submit the login form with empty credentials
    Then I should see 2 inline "Required" validation messages

  @smoke @P0 @guest @TC-AUTH-04
  Scenario: Logout invalidates session and blocks post-logout Dashboard access
    Given I am on the OrangeHRM login page as a guest
    When I sign in with valid Admin credentials
    And I log out from the topbar user menu
    And I attempt to return to the Dashboard after logging out
    Then I should remain restricted to the Login page

  @regression @P2 @guest @TC-AUTH-05
  Scenario: Login page exposes accessible metadata, CSRF token, and Forgot Password route
    Given I am on the OrangeHRM login page as a guest
    Then the Login page should expose accessible metadata and a CSRF token
    When I open the Forgot your password flow and cancel back to login
    Then the Reset Password heading should have been accessible before returning to Login
