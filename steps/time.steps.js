const { expect } = require('@playwright/test');
const { Given, When, Then } = require('../fixtures/bddFixtures');

Given('I am on the Employee Timesheets page', async ({ timePage, adminCredentials }) => {
  await timePage.openEmployeeTimesheets(adminCredentials);
});

Given('I am on the My Timesheet page', async ({ timePage, adminCredentials }) => {
  await timePage.openMyTimesheet(adminCredentials);
});

Given('I am on the Attendance Punch page', async ({ timePage, adminCredentials }) => {
  await timePage.openAttendancePunch(adminCredentials);
});

Then('Employee Timesheets should display Select Employee search and pending actions table', async ({ timePage }) => {
  await expect(timePage.selectEmployeeHeading).toBeVisible();
  await expect(timePage.pendingTimesheetsHeading).toBeVisible();
  await expect(timePage.viewButton).toBeVisible();
  await expect(timePage.columnHeaders.filter({ hasText: 'Employee Name' }).first()).toBeVisible();
  await expect(timePage.columnHeaders.filter({ hasText: 'Timesheet Period' }).first()).toBeVisible();
});

Then('My Timesheet should display the current weekly period and submission status', async ({ timePage }) => {
  await expect(timePage.myTimesheetHeading).toBeVisible();
  const periodVal = await timePage.timesheetPeriodInput.inputValue();
  expect(periodVal).toContain('to');
  await expect(timePage.timesheetStatusText).toContainText('Status:');
});

When('I submit an attendance punch with note {string}', async ({ timePage, scenarioState }, noteText) => {
  scenarioState.beforePunchState = await timePage.submitAttendancePunch(noteText);
});

Then('the attendance state should save and toggle to the opposite punch action', async ({ timePage, scenarioState }) => {
  const expectedNextHeading = scenarioState.beforePunchState === 'Punch In' ? 'Punch Out' : 'Punch In';
  await expect(timePage.punchHeading).toHaveText(expectedNextHeading);
});
