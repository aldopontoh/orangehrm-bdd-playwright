const path = require('path');
const fs = require('fs');
const { test: base, createBdd } = require('playwright-bdd');
const { LoginPage } = require('../pages/LoginPage');
const { DashboardPage } = require('../pages/DashboardPage');
const { PimPage } = require('../pages/PimPage');
const { AdminPage } = require('../pages/AdminPage');
const { LeavePage } = require('../pages/LeavePage');
const { TimePage } = require('../pages/TimePage');
const { RecruitmentPage } = require('../pages/RecruitmentPage');
const { MyInfoPage } = require('../pages/MyInfoPage');
const { CleanupRegistry } = require('../utils/testDataFactory');
const { ensureEnglishLocale } = require('../utils/uiHelpers');

const AUTH_FILE = path.resolve(__dirname, '../playwright/.auth/admin.json');

const test = base.extend({
  adminCredentials: async ({}, use) => {
    await use({
      username: process.env.ADMIN_USERNAME || 'Admin',
      password: process.env.ADMIN_PASSWORD || 'admin123',
    });
  },
  scenarioState: async ({}, use) => {
    await use({});
  },
  cleanupRegistry: async ({}, use) => {
    await use(new CleanupRegistry());
  },
  loginPage: async ({ page, adminCredentials }, use) => {
    await use(new LoginPage(page, adminCredentials));
  },
  dashboardPage: async ({ page, adminCredentials }, use) => {
    await use(new DashboardPage(page, adminCredentials));
  },
  pimPage: async ({ page, adminCredentials }, use) => {
    await use(new PimPage(page, adminCredentials));
  },
  adminPage: async ({ page, adminCredentials }, use) => {
    await use(new AdminPage(page, adminCredentials));
  },
  leavePage: async ({ page, adminCredentials }, use) => {
    await use(new LeavePage(page, adminCredentials));
  },
  timePage: async ({ page, adminCredentials }, use) => {
    await use(new TimePage(page, adminCredentials));
  },
  recruitmentPage: async ({ page, adminCredentials }, use) => {
    await use(new RecruitmentPage(page, adminCredentials));
  },
  myInfoPage: async ({ page, adminCredentials }, use) => {
    await use(new MyInfoPage(page, adminCredentials));
  },
});

const { Given, When, Then, Before, After } = createBdd(test);

/**
 * Isolated guest-session hook: clears cookies so login/logout/ESS tests
 * never invalidate the shared Admin storageState PHP session.
 */
Before({ tags: '@guest' }, async ({ page }) => {
  await ensureEnglishLocale(page);
  await page.context().clearCookies();
});

/**
 * Self-cleaning After hook: removes all AutoQA_* entities created during the scenario
 * using an isolated Admin context so shared demo sandbox stays pristine even on failure.
 */
After(async ({ browser, cleanupRegistry, adminCredentials }) => {
  const hasCleanupWork =
    cleanupRegistry.systemUsers.length > 0 ||
    cleanupRegistry.candidates.length > 0 ||
    cleanupRegistry.employees.length > 0;

  if (!hasCleanupWork) {
    return;
  }

  const contextOptions = {
    baseURL: process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com',
  };
  if (fs.existsSync(AUTH_FILE)) {
    contextOptions.storageState = AUTH_FILE;
  }

  const cleanupContext = await browser.newContext(contextOptions);
  const cleanupPage = await cleanupContext.newPage();

  try {
    const admin = new AdminPage(cleanupPage);
    const recruitment = new RecruitmentPage(cleanupPage);
    const pim = new PimPage(cleanupPage);

    for (const username of [...cleanupRegistry.systemUsers]) {
      await admin.deleteSystemUserByUsername(username, adminCredentials).catch(() => {});
    }

    for (const candidate of [...cleanupRegistry.candidates]) {
      await recruitment
        .deleteCandidateByName(candidate.firstName, candidate.fullName, adminCredentials)
        .catch(() => {});
    }

    for (const employee of [...cleanupRegistry.employees]) {
      await pim.deleteEmployeeById(employee.employeeId, adminCredentials).catch(() => {});
    }
  } finally {
    await cleanupContext.close();
  }
});

module.exports = { test, Given, When, Then, Before, After };
