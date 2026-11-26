const { expect } = require('@playwright/test');
const { Given, When, Then } = require('../fixtures/bddFixtures');
const { createEmployee } = require('../utils/testDataFactory');

Given('I am on the PIM Employee List page', async ({ pimPage, adminCredentials }) => {
  await pimPage.openEmployeeList(adminCredentials);
});

Given('I am on the PIM Add Employee page', async ({ pimPage, adminCredentials }) => {
  await pimPage.openAddEmployee(adminCredentials);
});

Given('a newly created AutoQA employee exists in PIM', async ({ pimPage, scenarioState, cleanupRegistry, adminCredentials }) => {
  const employee = createEmployee();
  await pimPage.openAddEmployee(adminCredentials);
  await pimPage.fillEmployeeCoreFields(employee);
  await pimPage.saveEmployee();
  await expect(pimPage.page).toHaveURL(/\/web\/index\.php\/pim\/viewPersonalDetails\/empNumber\/\d+/, {
    timeout: 30_000,
  });
  await pimPage.waitForSpinnerToDisappear();
  scenarioState.employee = employee;
  cleanupRegistry.trackEmployee(employee);
});

When('I add a new AutoQA employee with a unique Employee ID', async ({ pimPage, scenarioState, cleanupRegistry }) => {
  const employee = createEmployee();
  await pimPage.fillEmployeeCoreFields(employee);
  await pimPage.saveEmployee();
  scenarioState.employee = employee;
  cleanupRegistry.trackEmployee(employee);
});

Then('I should see a success toast and land on the new employee Personal Details page', async ({ page, pimPage, scenarioState }) => {
  await expect(pimPage.toastContainer.first()).toContainText('Successfully Saved');
  await expect(page).toHaveURL(/\/web\/index\.php\/pim\/viewPersonalDetails\/empNumber\/\d+/, {
    timeout: 30_000,
  });
  await pimPage.waitForSpinnerToDisappear();
  await expect(pimPage.personalDetailsHeading).toBeVisible();
  await expect(pimPage.profileFullNameHeading).toContainText(scenarioState.employee.firstName);
});

When('I search the Employee List by the AutoQA employee ID', async ({ pimPage, scenarioState, adminCredentials }) => {
  await pimPage.openEmployeeList(adminCredentials);
  await pimPage.searchByEmployeeId(scenarioState.employee.employeeId);
});

Then('the Employee List should display the matching AutoQA employee row', async ({ pimPage, scenarioState }) => {
  const row = pimPage.getEmployeeRowById(scenarioState.employee.employeeId);
  await expect(row).toBeVisible();
  await expect(row).toContainText(scenarioState.employee.firstName);
});

When('I reset the PIM Employee List search filters', async ({ pimPage }) => {
  await pimPage.resetSearch();
});

Then('the Employee ID search input should be cleared', async ({ pimPage }) => {
  const empIdInput = pimPage.getFormGroup('Employee Id').locator('input').first();
  await expect(empIdInput).toHaveValue('');
});

When('I update the employee Personal Details and inspect the Job tab', async ({ pimPage, scenarioState }) => {
  await pimPage.updatePersonalDetails({
    otherId: scenarioState.employee.otherId,
    maritalStatus: 'Single',
  });
  await pimPage.openJobTab();
  await expect(pimPage.jobDetailsHeading).toBeVisible();
  await pimPage.openPersonalDetailsTab();
});

Then('the updated Personal Details should persist for the AutoQA employee', async ({ pimPage, scenarioState }) => {
  const otherIdInput = pimPage.getFormGroup('Other Id').locator('input').first();
  const maritalSelect = pimPage.getFormGroup('Marital Status').locator('.oxd-select-text').first();
  await expect(otherIdInput).toHaveValue(scenarioState.employee.otherId);
  await expect(maritalSelect).toContainText('Single');
});

When('I submit the Add Employee form with blank required fields', async ({ pimPage }) => {
  await pimPage.saveEmployee();
});

When('I enter a 31-character First Name on Add Employee', async ({ pimPage }) => {
  await pimPage.firstNameInput.fill('A'.repeat(31));
  await pimPage.firstNameInput.press('Tab');
});

Then('Add Employee should display inline error {string}', async ({ pimPage }, expectedMessage) => {
  await expect(pimPage.inlineErrors.filter({ hasText: expectedMessage }).first()).toBeVisible();
});

When('I delete the AutoQA employee from the Employee List', async ({ pimPage, scenarioState, cleanupRegistry, adminCredentials }) => {
  const result = await pimPage.deleteEmployeeById(scenarioState.employee.employeeId, adminCredentials);
  const deleted = typeof result === 'object' ? result.deleted : Boolean(result);
  scenarioState.employeeDeleted = deleted;
  scenarioState.lastToastText = typeof result === 'object' ? result.toastText : '';
  if (deleted) {
    cleanupRegistry.untrackEmployee(scenarioState.employee.employeeId);
  }
});

Then('the AutoQA employee should no longer appear in Employee List search results', async ({ pimPage, scenarioState }) => {
  expect(scenarioState.employeeDeleted).toBe(true);
  expect(scenarioState.lastToastText).toContain('Successfully Deleted');
  await pimPage.searchByEmployeeId(scenarioState.employee.employeeId);
  await expect(pimPage.recordsFoundText).toContainText('No Records Found');
});
