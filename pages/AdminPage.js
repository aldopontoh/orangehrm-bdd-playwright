const { BasePage } = require('./BasePage');

class AdminPage extends BasePage {
  constructor(page, credentials = null) {
    super(page, credentials);
    this.adminHeading = page.getByRole('heading', { name: 'Admin', level: 6 });
    this.systemUsersHeading = page.getByRole('heading', { name: 'System Users', level: 5 });
    this.addUserHeading = page.getByRole('heading', { name: 'Add User', level: 6 });
    this.editUserHeading = page.getByRole('heading', { name: 'Edit User', level: 6 });

    this.addButton = page.getByRole('button', { name: 'Add' });
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.resetButton = page.getByRole('button', { name: 'Reset' });
    this.saveButton = page.getByRole('button', { name: 'Save' });
  }

  async openSystemUsers(credentials = this.credentials) {
    await this.gotoPath('/web/index.php/admin/viewSystemUsers', credentials);
    await this.systemUsersHeading.waitFor({ state: 'visible' });
  }

  async openAddUser(credentials = this.credentials) {
    await this.gotoPath('/web/index.php/admin/saveSystemUser', credentials);
    await this.addUserHeading.waitFor({ state: 'visible' });
  }

  async searchUser({ username, role }) {
    if (username) {
      await this.fillInputByLabel('Username', username);
    }
    if (role) {
      await this.selectDropdownOption('User Role', role);
    }
    await Promise.all([
      this.page
        .waitForResponse(
          (res) => res.url().includes('/api/v2/admin/users') && res.status() === 200,
          { timeout: 15_000 }
        )
        .catch(() => {}),
      this.searchButton.click(),
    ]);
    await this.waitForSpinnerToDisappear();
  }

  getUserRowByUsername(username) {
    return this.tableCards.filter({ hasText: username }).first();
  }

  async createSystemUser(user) {
    await this.openAddUser();
    await this.selectDropdownOption('User Role', user.role);
    await this.selectAutocompleteOption('Employee Name', user.employeeSearchTerm, user.employeeSearchTerm);
    await this.selectDropdownOption('Status', user.status);
    await this.fillInputByLabel('Username', user.username);
    await this.fillInputByLabel('Password', user.password);
    await this.fillInputByLabel('Confirm Password', user.password);
    await this.saveButton.click();
    await this.waitForToast();
    await this.page.waitForURL(/\/web\/index\.php\/admin\/viewSystemUsers/, { timeout: 30_000 });
    await this.waitForSpinnerToDisappear();
  }

  async editUserStatus(username, newStatus) {
    await this.openSystemUsers();
    await this.searchUser({ username });
    const row = this.getUserRowByUsername(username);
    await row.locator('button:has(.bi-pencil-fill)').first().click();
    await this.waitForSpinnerToDisappear();
    await this.editUserHeading.waitFor({ state: 'visible' });
    await this.selectDropdownOption('Status', newStatus);
    await this.saveButton.click();
    await this.waitForToast();
    await this.page.waitForURL(/\/web\/index\.php\/admin\/viewSystemUsers/, { timeout: 30_000 });
    await this.waitForSpinnerToDisappear();
  }

  async deleteSystemUserByUsername(username, credentials = null) {
    // Safety guard: NEVER delete default Admin user
    if (!username || username.toLowerCase() === 'admin' || !username.startsWith('AutoQA_')) {
      return false;
    }
    await this.openSystemUsers(credentials);
    await this.searchUser({ username });
    const row = this.getUserRowByUsername(username);
    if ((await row.count()) === 0) {
      return false;
    }
    await row.locator('button:has(.bi-trash)').first().click();
    const toastText = await this.confirmModalDelete();
    return { deleted: true, toastText };
  }
}

module.exports = { AdminPage };
