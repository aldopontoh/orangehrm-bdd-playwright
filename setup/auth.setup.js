const { test: setup, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const {
  ensureEnglishLocale,
  waitForSpinnersToDisappear,
  gotoWithNetworkRetry,
} = require('../utils/uiHelpers');

const AUTH_FILE = path.resolve(__dirname, '../playwright/.auth/admin.json');

setup('authenticate as Admin and persist storageState', async ({ page }) => {
  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });

  const username = process.env.ADMIN_USERNAME || 'Admin';
  const password = process.env.ADMIN_PASSWORD || 'admin123';

  await gotoWithNetworkRetry(page, '/web/index.php/auth/login');
  // Use locale-proof form controls so setup succeeds even if another demo user changed UI language
  await page.locator('input[name="username"]').fill(username);
  await page.locator('input[name="password"]').fill(password);
  await page.locator('button[type="submit"]').click();

  await expect(page).toHaveURL(/\/web\/index\.php\/dashboard\/index/, { timeout: 30_000 });
  await waitForSpinnersToDisappear(page);

  // Restore English (en_US) if another shared-sandbox user switched global localization
  const localeChanged = await ensureEnglishLocale(page);
  if (localeChanged) {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitForSpinnersToDisappear(page);
  }

  await expect(page.getByRole('heading', { name: 'Dashboard', level: 6 })).toBeVisible();

  await page.context().storageState({ path: AUTH_FILE });
});
