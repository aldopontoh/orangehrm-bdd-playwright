const { expect } = require('@playwright/test');
const { Given, When, Then } = require('../fixtures/bddFixtures');

Given('I am on the OrangeHRM login page as a guest', async ({ loginPage }) => {
  await loginPage.openAsGuest();
});

When('I sign in with valid Admin credentials', async ({ loginPage, adminCredentials }) => {
  await loginPage.login(adminCredentials.username, adminCredentials.password);
});

When(
  'I sign in with username {string} and password {string}',
  async ({ loginPage }, username, password) => {
    await loginPage.login(username, password);
  }
);

When('I submit the login form with empty credentials', async ({ loginPage }) => {
  await loginPage.login('', '');
});

When('I log out from the topbar user menu', async ({ dashboardPage }) => {
  await dashboardPage.logout();
});

When('I attempt to return to the Dashboard after logging out', async ({ page }) => {
  await page.goBack().catch(() => {});
  await page.goto('/web/index.php/dashboard/index', { waitUntil: 'domcontentloaded' });
});

When('I open the Forgot your password flow and cancel back to login', async ({ loginPage, scenarioState }) => {
  await loginPage.openForgotPassword();
  scenarioState.resetPasswordHeadingVisible = await loginPage.resetPasswordHeading.isVisible();
  await loginPage.cancelResetPassword();
});

Then('I should be redirected to the Dashboard with an active session', async ({ page, dashboardPage }) => {
  await expect(page).toHaveURL(/\/web\/index\.php\/dashboard\/index/);
  await expect(dashboardPage.dashboardHeading).toBeVisible();
  await expect(dashboardPage.userDropdownName).toBeVisible();
});

Then('I should see the authentication error alert {string}', async ({ page, loginPage }, message) => {
  await expect(page).toHaveURL(/\/web\/index\.php\/auth\/login/);
  await expect(loginPage.errorAlert).toBeVisible();
  await expect(loginPage.errorAlert).toContainText(message);
});

Then('I should see {int} inline {string} validation messages', async ({ loginPage }, expectedCount, expectedText) => {
  await expect(loginPage.inlineErrors).toHaveCount(expectedCount);
  for (let i = 0; i < expectedCount; i++) {
    await expect(loginPage.inlineErrors.nth(i)).toHaveText(expectedText);
  }
});

Then('I should remain restricted to the Login page', async ({ page, loginPage }) => {
  await expect(page).toHaveURL(/\/web\/index\.php\/auth\/login/);
  await expect(loginPage.loginHeading).toBeVisible();
});

Then('the Login page should expose accessible metadata and a CSRF token', async ({ page, loginPage }) => {
  await expect(page).toHaveTitle('OrangeHRM');
  await expect(loginPage.loginHeading).toBeVisible();
  const token = await loginPage.csrfTokenInput.getAttribute('value');
  expect(token && token.length > 10).toBeTruthy();
});

Then('the Reset Password heading should have been accessible before returning to Login', async ({ loginPage, scenarioState }) => {
  expect(scenarioState.resetPasswordHeadingVisible).toBe(true);
  await expect(loginPage.loginHeading).toBeVisible();
});
