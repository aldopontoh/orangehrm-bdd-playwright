const { BasePage } = require('./BasePage');

class LeavePage extends BasePage {
  constructor(page, credentials = null) {
    super(page, credentials);
    this.leaveHeading = page.getByRole('heading', { name: 'Leave', level: 6 });
    this.leaveListHeading = page.getByRole('heading', { name: 'Leave List', level: 5 });
    this.assignLeaveHeading = page.getByRole('heading', { name: 'Assign Leave', level: 6 });
    this.addEntitlementHeading = page.getByRole('heading', { name: 'Add Leave Entitlement', level: 6 });
    this.entitlementsHeading = page.getByRole('heading', { name: 'Entitlements', level: 6 });

    this.statusChips = page.locator('.oxd-chip');
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.resetButton = page.getByRole('button', { name: 'Reset' });
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.assignButton = page.getByRole('button', { name: 'Assign' });
    this.confirmModalButton = page.getByRole('button', { name: 'Confirm' });
    this.okModalButton = page.getByRole('button', { name: 'Ok' });
  }

  async openLeaveList(credentials = this.credentials) {
    await this.gotoPath('/web/index.php/leave/viewLeaveList', credentials);
    await this.leaveListHeading.waitFor({ state: 'visible' });
  }

  async openAddEntitlement(credentials = this.credentials) {
    await this.gotoPath('/web/index.php/leave/addLeaveEntitlement', credentials);
    await this.waitForSpinnerToDisappear();
  }

  async openAssignLeave(credentials = this.credentials) {
    await this.gotoPath('/web/index.php/leave/assignLeave', credentials);
    await this.assignLeaveHeading.waitFor({ state: 'visible' });
  }

  async addIndividualEntitlement(employee, days = '10') {
    await this.openAddEntitlement();
    await this.selectAutocompleteOption('Employee Name', employee.firstName, employee.firstName);
    const leaveType = await this.selectFirstAvailableDropdownOption('Leave Type');
    await this.fillInputByLabel('Entitlement', String(days));
    await this.saveButton.click();

    await this.confirmModalButton.waitFor({ state: 'visible', timeout: 15_000 });
    await this.confirmModalButton.click();
    const toastText = await this.getToastText(15_000);
    await this.waitForSpinnerToDisappear();
    return { leaveType, toastText };
  }

  async assignLeaveToEmployee({ employee, leaveType, fromDate, toDate, comments }) {
    await this.openAssignLeave();
    await this.selectAutocompleteOption('Employee Name', employee.firstName, employee.firstName);
    if (leaveType) {
      await this.selectDropdownOption('Leave Type', leaveType);
    } else {
      await this.selectFirstAvailableDropdownOption('Leave Type');
    }
    await this.waitForSpinnerToDisappear();
    await this.fillDateByLabel('From Date', fromDate);
    await this.fillDateByLabel('To Date', toDate);

    if (comments) {
      await this.getFormGroup('Comments').locator('textarea').fill(comments);
    }

    await this.assignButton.click();
    // Handle optional Insufficient Balance confirmation dialog if triggered
    const okVisible = await this.okModalButton.isVisible().catch(() => false);
    if (okVisible) {
      await this.okModalButton.click();
    }
    await this.waitForToast();
    await this.waitForSpinnerToDisappear();
  }

  async filterLeaveListByEmployeeAndStatus(employee, statusLabel = 'Scheduled') {
    await this.openLeaveList();
    // Add requested status chip if not already selected
    const chipExists = await this.statusChips.filter({ hasText: statusLabel }).count();
    if (chipExists === 0) {
      await this.selectDropdownOption('Show Leave with Status', statusLabel);
    }
    await this.selectAutocompleteOption('Employee Name', employee.firstName, employee.firstName);
    await this.searchButton.click();
    await this.waitForSpinnerToDisappear();
  }

  getLeaveRowForEmployee(employeeFirstName) {
    return this.tableCards.filter({ hasText: employeeFirstName }).first();
  }

  async cancelLeaveForEmployee(employeeFirstName) {
    const row = this.getLeaveRowForEmployee(employeeFirstName);
    const directCancel = row.getByRole('button', { name: 'Cancel' });
    if (await directCancel.isVisible().catch(() => false)) {
      await directCancel.click();
      await this.waitForToast();
      await this.waitForSpinnerToDisappear();
      return;
    }
    // Otherwise open three-dots row action menu
    await row.locator('button:has(.bi-three-dots-vertical)').first().click();
    await this.page.getByText('Cancel Leave', { exact: true }).click();
    await this.waitForToast();
    await this.waitForSpinnerToDisappear();
  }
}

module.exports = { LeavePage };
