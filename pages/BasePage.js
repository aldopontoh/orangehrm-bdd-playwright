const path = require('path');
const fs = require('fs');
const {
  waitForSpinnersToDisappear,
  clearAndFill,
  formatDateForPlaceholder,
  ensureEnglishLocale,
  gotoWithNetworkRetry,
} = require('../utils/uiHelpers');

const AUTH_FILE = path.resolve(__dirname, '../playwright/.auth/admin.json');

/**
 * BasePage encapsulates shared OrangeHRM OXD Vue shell interactions and custom controls.
 * STRICT RULE: Locators and actions only — all assertions belong in step definitions.
 */
class BasePage {
  constructor(page, credentials = null) {
    this.page = page;
    this.credentials = credentials;
    this.sidepanel = page.locator('aside.oxd-sidepanel');
    this.sidepanelNav = page.getByRole('navigation', { name: 'Sidepanel' });
    this.sideMenuSearchInput = page.getByPlaceholder('Search');
    this.sideMenuItems = page.locator('.oxd-main-menu-item');
    this.sideMenuToggleBtn = page.locator('.oxd-main-menu-button');
    this.topbarModuleHeading = page.locator('.oxd-topbar-header-breadcrumb-module');
    this.userDropdownTab = page.locator('.oxd-userdropdown-tab');
    this.userDropdownName = page.locator('.oxd-userdropdown-name');
    this.toastContainer = page.locator('.oxd-toast');
    this.toastTitle = page.locator('.oxd-text--toast-title');
    this.toastMessage = page.locator('.oxd-text--toast-message');
    this.inlineErrors = page.locator('.oxd-input-field-error-message');
    this.tableCards = page.locator('.oxd-table-card');
    this.recordsFoundText = page.locator('.orangehrm-horizontal-padding span.oxd-text');
  }

  async gotoPath(routePath, credentials = this.credentials) {
    await gotoWithNetworkRetry(this.page, routePath);
    const shellOrLogin = this.page
      .locator('a.oxd-main-menu-item[href*="dashboard/index"], input[name="username"]')
      .first();
    const mounted = await shellOrLogin
      .waitFor({ state: 'visible', timeout: 15_000 })
      .then(() => true)
      .catch(() => false);
    if (!mounted) {
      await gotoWithNetworkRetry(this.page, routePath);
      await shellOrLogin.waitFor({ state: 'visible', timeout: 25_000 }).catch(() => {});
    }
    await this.waitForSpinnerToDisappear();

    // Auto-recover if shared demo sandbox reset/expired storageState session
    if (credentials && this.page.url().includes('/auth/login')) {
      await this.page.locator('input[name="username"]').fill(credentials.username);
      await this.page.locator('input[name="password"]').fill(credentials.password);
      await this.page.locator('button[type="submit"]').click();
      // OrangeHRM may redirect either to /dashboard/index OR directly back to the requested routePath
      await this.page.waitForURL((url) => !url.pathname.includes('/auth/login'), {
        timeout: 30_000,
      });
      await this.page
        .locator('a.oxd-main-menu-item[href*="dashboard/index"]')
        .waitFor({ state: 'visible', timeout: 25_000 })
        .catch(() => {});
      await this.waitForSpinnerToDisappear();

      // Persist recovered Admin session back to storageState so subsequent tests stay authenticated
      try {
        fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });
        await this.page.context().storageState({ path: AUTH_FILE });
      } catch {
        // Non-fatal if storageState write is skipped
      }

      if (!this.page.url().includes(routePath)) {
        await this.page.goto(routePath, { waitUntil: 'domcontentloaded' });
        await shellOrLogin.waitFor({ state: 'visible', timeout: 25_000 }).catch(() => {});
        await this.waitForSpinnerToDisappear();
      }
    }

    // Mid-run locale guard (runs after Vue mounts sidebar): restores en_US if another demo user changed language
    const dashboardNavLink = this.page.locator('a.oxd-main-menu-item[href*="dashboard/index"]');
    if (await dashboardNavLink.isVisible().catch(() => false)) {
      const labelText = ((await dashboardNavLink.textContent()) || '').trim();
      if (labelText && labelText !== 'Dashboard') {
        const changed = await ensureEnglishLocale(this.page);
        if (changed) {
          await this.page.reload({ waitUntil: 'domcontentloaded' });
          await dashboardNavLink.waitFor({ state: 'visible', timeout: 25_000 }).catch(() => {});
          await this.waitForSpinnerToDisappear();
        }
      }
    }

    // Mid-reset i18n cache guard: if OrangeHRM served raw translation keys (e.g. "general.upgrade"), reload once
    const rawI18nButton = this.page.locator('button:has-text("general.upgrade")');
    if (await rawI18nButton.isVisible().catch(() => false)) {
      await this.page.reload({ waitUntil: 'domcontentloaded' });
      await shellOrLogin.waitFor({ state: 'visible', timeout: 25_000 }).catch(() => {});
      await this.waitForSpinnerToDisappear();
    }
  }

  async waitForSpinnerToDisappear() {
    await waitForSpinnersToDisappear(this.page);
  }

  async waitForToast(timeout = 15_000) {
    await this.toastContainer.first().waitFor({ state: 'visible', timeout });
    return this.toastContainer.first();
  }

  async getToastText(timeout = 15_000) {
    const toast = await this.waitForToast(timeout);
    const fullText = (await toast.textContent()) || '';
    return fullText.trim();
  }

  async clickNavigationLink(locator) {
    const href = await locator.getAttribute('href').catch(() => null);
    try {
      await locator.click({ timeout: 45_000 });
      await this.waitForSpinnerToDisappear();
    } catch (err) {
      if (href && href !== '#') {
        await this.gotoPath(href, this.credentials);
      } else {
        throw err;
      }
    }
  }

  async navigateViaSideMenu(menuName) {
    await this.clickNavigationLink(this.sidepanelNav.getByRole('link', { name: menuName, exact: true }));
  }

  async filterSideMenu(query) {
    await clearAndFill(this.sideMenuSearchInput, query);
  }

  async toggleSideMenu() {
    await this.sideMenuToggleBtn.click();
  }

  async openUserDropdown() {
    await this.userDropdownTab.click();
    await this.page.getByRole('menuitem', { name: 'Logout' }).waitFor({ state: 'visible' });
  }

  async logout() {
    await this.openUserDropdown();
    await this.page.getByRole('menuitem', { name: 'Logout' }).click();
    await this.page.waitForURL(/\/web\/index\.php\/auth\/login/, { timeout: 30_000 });
  }

  getFormGroup(labelText) {
    return this.page.locator('.oxd-input-group').filter({
      has: this.page.locator('label', { hasText: new RegExp(`^${this.escapeRegex(labelText)}$`) }),
    }).first();
  }

  escapeRegex(text) {
    return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  async fillInputByLabel(labelText, value) {
    const input = this.getFormGroup(labelText).locator('input').first();
    await clearAndFill(input, value);
  }

  async selectDropdownOption(labelText, optionText) {
    const group = this.getFormGroup(labelText);
    const selectTrigger = group.locator('.oxd-select-text').first();
    await selectTrigger.click();
    const listbox = this.page.locator('[role="listbox"]');
    await listbox.waitFor({ state: 'visible' });
    await listbox.getByRole('option', { name: optionText, exact: true }).click();
  }

  async selectFirstAvailableDropdownOption(labelText) {
    const group = this.getFormGroup(labelText);
    const selectTrigger = group.locator('.oxd-select-text').first();
    await selectTrigger.click();
    const listbox = this.page.locator('[role="listbox"]');
    await listbox.waitFor({ state: 'visible' });
    const options = listbox.locator('[role="option"]');
    const count = await options.count();
    for (let i = 0; i < count; i++) {
      const text = ((await options.nth(i).textContent()) || '').trim();
      if (text && !text.includes('-- Select --') && !text.includes('No Records Found')) {
        await options.nth(i).click();
        return text;
      }
    }
    throw new Error(`No selectable option found in dropdown "${labelText}"`);
  }

  async selectAutocompleteOption(labelText, searchText, expectedOptionText = null) {
    const group = this.getFormGroup(labelText);
    const input = group.locator('input[placeholder="Type for hints..."]').first();
    await clearAndFill(input, searchText);

    const listbox = this.page.locator('[role="listbox"]');
    await listbox.waitFor({ state: 'visible', timeout: 15_000 });
    await listbox
      .getByText('Searching....')
      .waitFor({ state: 'hidden', timeout: 15_000 })
      .catch(() => {});

    const targetOption = expectedOptionText
      ? listbox.locator('[role="option"]', { hasText: expectedOptionText }).first()
      : listbox.locator('[role="option"]').first();

    await targetOption.waitFor({ state: 'visible', timeout: 15_000 });
    await targetOption.click();
  }

  async fillDateByLabel(labelText, dateObj) {
    const group = this.getFormGroup(labelText);
    const input = group.locator('input').first();
    await input.waitFor({ state: 'visible' });
    const placeholder = (await input.getAttribute('placeholder')) || 'yyyy-dd-mm';
    const formatted = formatDateForPlaceholder(dateObj, placeholder);
    await clearAndFill(input, formatted);
    await input.press('Tab');
    return formatted;
  }

  async confirmModalDelete() {
    const confirmBtn = this.page.getByRole('button', { name: 'Yes, Delete' });
    await confirmBtn.waitFor({ state: 'visible' });
    await confirmBtn.click();
    const toastText = await this.getToastText(15_000).catch(() => '');
    await this.waitForSpinnerToDisappear();
    return toastText;
  }

  async getAllInlineErrorTexts() {
    const texts = await this.inlineErrors.allTextContents();
    return texts.map((t) => t.trim()).filter(Boolean);
  }
}

module.exports = { BasePage };
