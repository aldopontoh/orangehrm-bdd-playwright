const { expect } = require('@playwright/test');
const { Given, When, Then } = require('../fixtures/bddFixtures');
const { getFutureWeekday } = require('../utils/uiHelpers');

Given('I am on the Leave List page', async ({ leavePage, adminCredentials }) => {
  await leavePage.openLeaveList(adminCredentials);
});

Given('I am on the Assign Leave page', async ({ leavePage, adminCredentials }) => {
  await leavePage.openAssignLeave(adminCredentials);
});

Then('Leave List should display the default {string} status chip and filter cleanly', async ({ leavePage }, defaultStatus) => {
  await expect(leavePage.leaveListHeading).toBeVisible();
  await expect(leavePage.statusChips.filter({ hasText: defaultStatus }).first()).toBeVisible();
  await leavePage.searchButton.click();
  await leavePage.waitForSpinnerToDisappear();
  await leavePage.resetButton.click();
  await leavePage.waitForSpinnerToDisappear();
  await expect(leavePage.leaveListHeading).toBeVisible();
  await expect(leavePage.getFormGroup('Employee Name').locator('input')).toHaveValue('');
});

When('I add a {int}-day Leave Entitlement for the AutoQA employee', async ({ leavePage, scenarioState }, days) => {
  const { leaveType, toastText } = await leavePage.addIndividualEntitlement(
    scenarioState.employee,
    String(days)
  );
  scenarioState.entitledLeaveType = leaveType;
  scenarioState.lastToastText = toastText;
});

Then('the Leave Entitlement should be saved successfully', async ({ scenarioState }) => {
  expect(scenarioState.entitledLeaveType).toBeTruthy();
  expect(scenarioState.lastToastText).toContain('Successfully Saved');
});

When('I assign a future weekday of leave to the entitled AutoQA employee', async ({ leavePage, scenarioState }) => {
  const leaveDate = getFutureWeekday(6);
  await leavePage.assignLeaveToEmployee({
    employee: scenarioState.employee,
    leaveType: scenarioState.entitledLeaveType,
    fromDate: leaveDate,
    toDate: leaveDate,
    comments: 'AutoQA Leave Assignment',
  });
});

Then('the assigned leave should appear in Leave List and cancel cleanly', async ({ leavePage, scenarioState }) => {
  await leavePage.filterLeaveListByEmployeeAndStatus(scenarioState.employee, 'Scheduled');
  const row = leavePage.getLeaveRowForEmployee(scenarioState.employee.firstName);
  await expect(row).toBeVisible();
  await expect(row).toContainText('Scheduled');

  await leavePage.cancelLeaveForEmployee(scenarioState.employee.firstName);
  await expect(leavePage.toastContainer.first()).toContainText('Successfully Updated');
});

When('I submit Assign Leave empty and then enter an inverted date range', async ({ leavePage }) => {
  await leavePage.assignButton.click();
  await expect(leavePage.inlineErrors.filter({ hasText: 'Required' }).first()).toBeVisible();

  const laterDate = getFutureWeekday(14);
  const earlierDate = getFutureWeekday(4);
  await leavePage.fillDateByLabel('From Date', laterDate);
  await leavePage.fillDateByLabel('To Date', earlierDate);
});

Then('Assign Leave should display inverted date validation {string}', async ({ leavePage }, expectedError) => {
  await expect(leavePage.inlineErrors.filter({ hasText: expectedError }).first()).toBeVisible();
});
