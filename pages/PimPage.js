const { BasePage } = require('./BasePage');
const { clearAndFill } = require('../utils/uiHelpers');

class PimPage extends BasePage {
  constructor(page, credentials = null) {
    super(page, credentials);
    this.pimHeading = page.getByRole('heading', { name: 'PIM', level: 6 });
    this.employeeInfoHeading = page.getByRole('heading', { name: 'Employee Information', level: 5 });
    this.addEmployeeHeading = page.getByRole('heading', { name: 'Add Employee', level: 6 });
    this.personalDetailsHeading = page.getByRole('heading', { name: 'Personal Details', level: 6 });
    this.jobDetailsHeading = page.getByRole('heading', { name: 'Job Details', level: 6 });

    this.addButton = page.getByRole('button', { name: 'Add' });
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.resetButton = page.getByRole('button', { name: 'Reset' });
    this.saveButton = page.getByRole('button', { name: 'Save' }).first();

    this.firstNameInput = page.getByPlaceholder('First Name');
    this.middleNameInput = page.getByPlaceholder('Middle Name');
    this.lastNameInput = page.getByPlaceholder('Last Name');
    this.createLoginSwitch = page.locator('.oxd-switch-input');
    this.profileFullNameHeading = page.locator('.orangehrm-edit-employee-name h6');
    this.personalDetailsTab = page.getByRole('link', { name: 'Personal Details' });
    this.jobTab = page.getByRole('link', { name: 'Job' });
  }

  async openEmployeeList(credentials = this.credentials) {
    await this.gotoPath('/web/index.php/pim/viewEmployeeList', credentials);
    await this.employeeInfoHeading.waitFor({ state: 'visible' });
  }

  async openAddEmployee(credentials = this.credentials) {
    await this.gotoPath('/web/index.php/pim/addEmployee', credentials);
    await this.addEmployeeHeading.waitFor({ state: 'visible' });
  }

  async fillEmployeeCoreFields(employee) {
    await clearAndFill(this.firstNameInput, employee.firstName);
    if (employee.middleName !== undefined) {
      await clearAndFill(this.middleNameInput, employee.middleName);
    }
    await clearAndFill(this.lastNameInput, employee.lastName);
    if (employee.employeeId) {
      await this.fillInputByLabel('Employee Id', employee.employeeId);
    }
  }

  async enableCreateLoginDetails(username, password) {
    await this.createLoginSwitch.click();
    await this.fillInputByLabel('Username', username);
    await this.fillInputByLabel('Password', password);
    await this.fillInputByLabel('Confirm Password', password);
  }

  async saveEmployee() {
    await this.saveButton.click();
  }

  async createEmployeeRecord(employee, loginCreds = null) {
    await this.openAddEmployee();
    await this.fillEmployeeCoreFields(employee);
    if (loginCreds) {
      await this.enableCreateLoginDetails(loginCreds.username, loginCreds.password);
    }
    await this.saveEmployee();
    await this.page.waitForURL(/\/web\/index\.php\/pim\/viewPersonalDetails\/empNumber\/\d+/, {
      timeout: 30_000,
    });
    await this.waitForSpinnerToDisappear();
    await this.personalDetailsHeading.waitFor({ state: 'visible' });
  }

  async searchByEmployeeId(employeeId) {
    await this.fillInputByLabel('Employee Id', employeeId);
    await Promise.all([
      this.page
        .waitForResponse(
          (res) => res.url().includes('/api/v2/pim/employees') && res.status() === 200,
          { timeout: 15_000 }
        )
        .catch(() => {}),
      this.searchButton.click(),
    ]);
    await this.waitForSpinnerToDisappear();
  }

  async resetSearch() {
    await this.resetButton.click();
    await this.waitForSpinnerToDisappear();
  }

  getEmployeeRowById(employeeId) {
    return this.tableCards.filter({ hasText: employeeId }).first();
  }

  async updatePersonalDetails({ otherId, maritalStatus }) {
    await this.waitForSpinnerToDisappear();
    if (otherId) {
      await this.fillInputByLabel('Other Id', otherId);
    }
    if (maritalStatus) {
      await this.selectDropdownOption('Marital Status', maritalStatus);
    }
    await this.saveButton.click();
    await this.waitForToast();
    await this.waitForSpinnerToDisappear();
  }

  async openJobTab() {
    await this.clickNavigationLink(this.jobTab);
    await this.jobDetailsHeading.waitFor({ state: 'visible' });
  }

  async openPersonalDetailsTab() {
    await this.clickNavigationLink(this.personalDetailsTab);
    await this.personalDetailsHeading.waitFor({ state: 'visible' });
  }

  async deleteEmployeeById(employeeId, credentials = null) {
    await this.openEmployeeList(credentials);
    await this.searchByEmployeeId(employeeId);
    const row = this.getEmployeeRowById(employeeId);
    if ((await row.count()) === 0) {
      return false;
    }
    await row.locator('button:has(.bi-trash)').first().click();
    const toastText = await this.confirmModalDelete();
    return { deleted: true, toastText };
  }
}

module.exports = { PimPage };
