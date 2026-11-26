const { expect } = require('@playwright/test');
const { Given, When, Then } = require('../fixtures/bddFixtures');
const { createCandidate } = require('../utils/testDataFactory');

Given('I am on the Recruitment Candidates page', async ({ recruitmentPage, adminCredentials }) => {
  await recruitmentPage.openCandidates(adminCredentials);
});

Given('I am on the Recruitment Add Candidate page', async ({ recruitmentPage, adminCredentials }) => {
  await recruitmentPage.openAddCandidate(adminCredentials);
});

Given('a newly created AutoQA candidate exists in Recruitment', async ({ recruitmentPage, scenarioState, cleanupRegistry, adminCredentials }) => {
  await recruitmentPage.openCandidates(adminCredentials);
  const candidate = createCandidate();
  await recruitmentPage.createCandidate(candidate);
  scenarioState.candidate = candidate;
  cleanupRegistry.trackCandidate(candidate);
});

When('I add a new AutoQA candidate with a resume attachment', async ({ recruitmentPage, scenarioState, cleanupRegistry }) => {
  const candidate = createCandidate();
  await recruitmentPage.createCandidate(candidate);
  scenarioState.candidate = candidate;
  cleanupRegistry.trackCandidate(candidate);
});

Then('the AutoQA candidate profile should open in Application Stage', async ({ page, recruitmentPage, scenarioState }) => {
  await expect(page).toHaveURL(/\/web\/index\.php\/recruitment\/addCandidate\/\d+/);
  await expect(recruitmentPage.applicationStageHeading).toBeVisible();
  await expect(page.locator('.orangehrm-card-container').first()).toContainText(
    scenarioState.candidate.firstName
  );
});

When('I submit Add Candidate blank and then enter an invalid email {string}', async ({ recruitmentPage }, invalidEmail) => {
  await recruitmentPage.saveButton.click();
  await expect(recruitmentPage.inlineErrors.filter({ hasText: 'Required' }).first()).toBeVisible();
  await recruitmentPage.fillInputByLabel('Email', invalidEmail);
  await recruitmentPage.saveButton.click();
});

Then('Add Candidate should display email format error {string}', async ({ recruitmentPage }, expectedMessage) => {
  await expect(recruitmentPage.inlineErrors.filter({ hasText: expectedMessage }).first()).toBeVisible();
});

When('I search Candidates and delete the AutoQA candidate', async ({ recruitmentPage, scenarioState, cleanupRegistry, adminCredentials }) => {
  const result = await recruitmentPage.deleteCandidateByName(
    scenarioState.candidate.firstName,
    scenarioState.candidate.fullName,
    adminCredentials
  );
  const deleted = typeof result === 'object' ? result.deleted : Boolean(result);
  scenarioState.candidateDeleted = deleted;
  scenarioState.lastToastText = typeof result === 'object' ? result.toastText : '';
  if (deleted) {
    cleanupRegistry.untrackCandidate(scenarioState.candidate.firstName);
  }
});

Then('the AutoQA candidate deletion toast should confirm removal', async ({ recruitmentPage, scenarioState }) => {
  expect(scenarioState.candidateDeleted).toBe(true);
  expect(scenarioState.lastToastText).toContain('Successfully Deleted');
  await expect(recruitmentPage.recordsFoundText).toContainText('No Records Found');
});

When('I navigate to the Vacancies tab and open Add Vacancy', async ({ recruitmentPage, adminCredentials }) => {
  await recruitmentPage.openVacancies(adminCredentials);
  await expect(recruitmentPage.vacanciesHeading).toBeVisible();
  await recruitmentPage.openAddVacancyFromGrid();
});

Then('the Add Vacancy form should expose Vacancy Name, Job Title, and Hiring Manager controls', async ({ recruitmentPage }) => {
  await expect(recruitmentPage.addVacancyHeading).toBeVisible();
  await expect(recruitmentPage.getFormGroup('Vacancy Name').locator('input')).toBeVisible();
  await expect(recruitmentPage.getFormGroup('Job Title').locator('.oxd-select-text')).toBeVisible();
  await expect(
    recruitmentPage.getFormGroup('Hiring Manager').locator('input[placeholder="Type for hints..."]')
  ).toBeVisible();
});
