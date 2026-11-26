const { BasePage } = require('./BasePage');

class TimePage extends BasePage {
  constructor(page, credentials = null) {
    super(page, credentials);
    this.selectEmployeeHeading = page.getByRole('heading', { name: 'Select Employee', level: 6 });
    this.pendingTimesheetsHeading = page.getByRole('heading', {
      name: 'Timesheets Pending Action',
      level: 6,
    });
    this.myTimesheetHeading = page.getByRole('heading', { name: 'My Timesheet', level: 6 });
    this.timesheetPeriodInput = page.locator('.oxd-date-input input').first();
    this.timesheetStatusText = page.locator('.orangehrm-timesheet-footer--title p');
    this.viewButton = page.getByRole('button', { name: 'View' }).first();
    this.columnHeaders = page.locator('[role="columnheader"]');

    this.punchHeading = page.getByRole('heading', { name: /Punch (In|Out)/, level: 6 });
    this.punchNoteTextarea = page.getByPlaceholder('Type here');
    this.punchActionButton = page.getByRole('button', { name: /^(In|Out)$/ });
  }

  async openEmployeeTimesheets(credentials = null) {
    await this.gotoPath('/web/index.php/time/viewEmployeeTimesheet', credentials);
    await this.selectEmployeeHeading.waitFor({ state: 'visible' });
  }

  async openMyTimesheet(credentials = null) {
    await this.gotoPath('/web/index.php/time/viewMyTimesheet', credentials);
    await this.myTimesheetHeading.waitFor({ state: 'visible' });
  }

  async openAttendancePunch(credentials = null) {
    await this.gotoPath('/web/index.php/attendance/punchIn', credentials);
    await this.punchHeading.waitFor({ state: 'visible' });
  }

  async getCurrentPunchHeadingText() {
    return ((await this.punchHeading.textContent()) || '').trim();
  }

  async submitAttendancePunch(noteText) {
    const beforeState = await this.getCurrentPunchHeadingText();
    await this.punchNoteTextarea.fill(noteText);
    await this.punchActionButton.click();
    await this.waitForToast();
    await this.waitForSpinnerToDisappear();
    return beforeState;
  }
}

module.exports = { TimePage };
