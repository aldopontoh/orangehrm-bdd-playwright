const { BasePage } = require('./BasePage');

class DashboardPage extends BasePage {
  constructor(page, credentials = null) {
    super(page, credentials);
    this.dashboardHeading = page.getByRole('heading', { name: 'Dashboard', level: 6 });
    this.widgetNames = page.locator('.orangehrm-dashboard-widget-name');
    this.quickLaunchAssignLeaveBtn = page.getByRole('button', { name: 'Assign Leave' });
    this.quickLaunchLeaveListBtn = page.getByRole('button', { name: 'Leave List' });
    this.quickLaunchMyTimesheetBtn = page.getByRole('button', { name: 'My Timesheet' });
  }

  async open(credentials = null) {
    await this.gotoPath('/web/index.php/dashboard/index', credentials);
    await this.dashboardHeading.waitFor({ state: 'visible' });
  }

  getWidgetByName(name) {
    return this.widgetNames.filter({ hasText: name }).first();
  }

  async clickQuickLaunch(shortcutName) {
    await this.page.getByRole('button', { name: shortcutName, exact: true }).click();
    await this.waitForSpinnerToDisappear();
  }

  getUserMenuItem(itemName) {
    return this.page.getByRole('menuitem', { name: itemName, exact: true });
  }
}

module.exports = { DashboardPage };
