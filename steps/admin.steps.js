const { expect } = require('@playwright/test');
const { Given, When, Then } = require('../fixtures/bddFixtures');
const { createEmployee, createSystemUser } = require('../utils/testDataFactory');

Given('I am on the Admin System Users page', async ({ adminPage, adminCredentials }) => {
  await adminPage.openSystemUsers(adminCredentials);
});

Given('I am on the Admin Add User page', async ({ adminPage, adminCredentials }) => {
  await adminPage.openAddUser(adminCredentials);
});

When('I search System Users for username {string} with role {string}', async ({ adminPage }, username, role) => {
  await adminPage.searchUser({ username, role });
});

Then('the System Users table should list {string} with role {string} and status {string}', async ({ adminPage }, username, role, status) => {
  const row = adminPage.getUserRowByUsername(username);
  await expect(row).toBeVisible();
  await expect(row).toContainText(role);
  await expect(row).toContainText(status);
});

When('I create a new AutoQA ESS System User linked to the AutoQA employee', async ({ adminPage, scenarioState, cleanupRegistry }) => {
  const systemUser = createSystemUser(scenarioState.employee, { role: 'ESS', status: 'Enabled' });
  await adminPage.createSystemUser(systemUser);
  scenarioState.systemUser = systemUser;
  cleanupRegistry.trackSystemUser(systemUser.username);
});

Then('the new AutoQA ESS System User should be searchable in System Users', async ({ adminPage, scenarioState }) => {
  await adminPage.searchUser({ username: scenarioState.systemUser.username });
  const row = adminPage.getUserRowByUsername(scenarioState.systemUser.username);
  await expect(row).toBeVisible();
  await expect(row).toContainText('ESS');
  await expect(row).toContainText('Enabled');
});

When('I test weak password length and confirm password mismatch on Add User', async ({ adminPage }) => {
  await adminPage.fillInputByLabel('Password', 'abc');
  await adminPage.fillInputByLabel('Confirm Password', 'Different@2026!');
  await adminPage.saveButton.click();
});

Then('Add User should display password policy validation errors', async ({ adminPage }) => {
  await expect(
    adminPage.inlineErrors.filter({ hasText: 'Should have at least 7 characters' }).first()
  ).toBeVisible();
  await expect(
    adminPage.inlineErrors.filter({ hasText: 'Passwords do not match' }).first()
  ).toBeVisible();
});

When(
  'I update the AutoQA System User status to {string} and then delete the user',
  async ({ adminPage, scenarioState, cleanupRegistry }, newStatus) => {
    await adminPage.editUserStatus(scenarioState.systemUser.username, newStatus);
    await adminPage.searchUser({ username: scenarioState.systemUser.username });
    const updatedRow = adminPage.getUserRowByUsername(scenarioState.systemUser.username);
    await expect(updatedRow).toContainText(newStatus);

    const result = await adminPage.deleteSystemUserByUsername(scenarioState.systemUser.username);
    const deleted = typeof result === 'object' ? result.deleted : Boolean(result);
    scenarioState.userDeleted = deleted;
    scenarioState.lastToastText = typeof result === 'object' ? result.toastText : '';
    if (deleted) {
      cleanupRegistry.untrackSystemUser(scenarioState.systemUser.username);
    }
  }
);

Then('the AutoQA System User should be cleanly deleted', async ({ adminPage, scenarioState }) => {
  expect(scenarioState.userDeleted).toBe(true);
  expect(scenarioState.lastToastText).toContain('Successfully Deleted');
  await adminPage.searchUser({ username: scenarioState.systemUser.username });
  await expect(adminPage.recordsFoundText).toContainText('No Records Found');
});

When(
  'an Admin onboards a new AutoQA employee with ESS login details enabled',
  async ({ pimPage, loginPage, adminCredentials, scenarioState, cleanupRegistry }) => {
    // Authenticate Admin on this isolated @guest page first
    await loginPage.openAsGuest();
    await loginPage.login(adminCredentials.username, adminCredentials.password);
    await expect(loginPage.page).toHaveURL(/\/web\/index\.php\/dashboard\/index/);

    const employee = createEmployee();
    const essUser = createSystemUser(employee, { role: 'ESS', status: 'Enabled' });

    await pimPage.createEmployeeRecord(employee, {
      username: essUser.username,
      password: essUser.password,
    });

    scenarioState.employee = employee;
    scenarioState.essUser = essUser;
    cleanupRegistry.trackSystemUser(essUser.username);
    cleanupRegistry.trackEmployee(employee);
  }
);

When('I switch to a clean guest session and sign in as the new AutoQA ESS user', async ({ loginPage, scenarioState }) => {
  await loginPage.openAsGuest();
  await loginPage.login(scenarioState.essUser.username, scenarioState.essUser.password);
});

Then('the ESS user should reach the Dashboard without access to Admin or Maintenance modules', async ({ page, dashboardPage }) => {
  await expect(page).toHaveURL(/\/web\/index\.php\/dashboard\/index/);
  await expect(dashboardPage.dashboardHeading).toBeVisible();
  await expect(dashboardPage.sidepanelNav.getByRole('link', { name: 'My Info', exact: true })).toBeVisible();
  await expect(dashboardPage.sidepanelNav.getByRole('link', { name: 'Admin', exact: true })).toHaveCount(0);
  await expect(dashboardPage.sidepanelNav.getByRole('link', { name: 'Maintenance', exact: true })).toHaveCount(0);
});
