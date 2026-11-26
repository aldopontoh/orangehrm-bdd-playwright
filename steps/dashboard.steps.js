const { expect } = require('@playwright/test');
const { Given, When, Then } = require('../fixtures/bddFixtures');

Given('I am on the OrangeHRM Dashboard', async ({ dashboardPage, adminCredentials }) => {
  await dashboardPage.open(adminCredentials);
});

Then('the Dashboard should display all core HR operational widgets', async ({ page, dashboardPage }) => {
  await expect(page).toHaveTitle('OrangeHRM');
  await expect(dashboardPage.dashboardHeading).toBeVisible();

  const expectedWidgets = [
    'Time at Work',
    'My Actions',
    'Quick Launch',
    'Buzz Latest Posts',
    'Employee Distribution by Sub Unit',
    'Employee Distribution by Location',
  ];

  for (const widgetName of expectedWidgets) {
    await expect(dashboardPage.getWidgetByName(widgetName)).toBeVisible();
  }
});

When('I filter the side navigation menu with {string}', async ({ dashboardPage }, keyword) => {
  await dashboardPage.filterSideMenu(keyword);
});

Then('the side navigation menu should only display {string}', async ({ dashboardPage }, expectedModule) => {
  await expect(dashboardPage.sideMenuItems).toHaveCount(1);
  await expect(dashboardPage.sideMenuItems.first()).toContainText(expectedModule);
});

When('I clear the side navigation search filter', async ({ dashboardPage }) => {
  await dashboardPage.filterSideMenu('');
});

Then('the full set of side navigation modules should be restored', async ({ dashboardPage }) => {
  const count = await dashboardPage.sideMenuItems.count();
  expect(count).toBeGreaterThanOrEqual(10);
});

When('I collapse and then re-expand the side navigation panel', async ({ dashboardPage, scenarioState }) => {
  await dashboardPage.toggleSideMenu();
  scenarioState.collapsedClass = await dashboardPage.sidepanel.getAttribute('class');
  await dashboardPage.toggleSideMenu();
  scenarioState.expandedClass = await dashboardPage.sidepanel.getAttribute('class');
});

Then('the side navigation panel should toggle its collapsed state cleanly', async ({ scenarioState }) => {
  expect(scenarioState.collapsedClass).toContain('toggled');
  expect(scenarioState.expandedClass).not.toContain('toggled');
});

When('I inspect the topbar user profile dropdown menu', async ({ dashboardPage }) => {
  await dashboardPage.openUserDropdown();
});

Then('all standard user profile menu actions should be visible', async ({ dashboardPage }) => {
  for (const item of ['About', 'Support', 'Change Password', 'Logout']) {
    await expect(dashboardPage.getUserMenuItem(item)).toBeVisible();
  }
  await dashboardPage.userDropdownTab.click();
});

When('I click the {string} Quick Launch shortcut', async ({ dashboardPage }, shortcutName) => {
  await dashboardPage.clickQuickLaunch(shortcutName);
});

Then('I should navigate to a route matching {string}', async ({ page }, routeFragment) => {
  await expect(page).toHaveURL(new RegExp(routeFragment));
});
