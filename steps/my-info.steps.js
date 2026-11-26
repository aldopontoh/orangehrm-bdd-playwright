const { expect } = require('@playwright/test');
const { Given, When, Then } = require('../fixtures/bddFixtures');

Given('I am on the My Info Personal Details page', async ({ myInfoPage, adminCredentials }) => {
  await myInfoPage.openMyInfo(adminCredentials);
});

Then('My Info should display Personal Details and self-service profile tabs', async ({ myInfoPage }) => {
  await expect(myInfoPage.personalDetailsHeading).toBeVisible();
  await expect(myInfoPage.personalDetailsTab).toBeVisible();
  await expect(myInfoPage.contactDetailsTab).toBeVisible();
  await expect(myInfoPage.emergencyContactsTab).toBeVisible();
  await expect(myInfoPage.jobTab).toBeVisible();
  await expect(myInfoPage.firstNameInput).toBeVisible();
  await expect(myInfoPage.lastNameInput).toBeVisible();
});

When('I open Contact Details and enter malformed Work Email {string}', async ({ myInfoPage }, badEmail) => {
  await myInfoPage.openContactDetailsTab();
  await expect(myInfoPage.addressHeading).toBeVisible();
  await expect(myInfoPage.telephoneHeading).toBeVisible();
  await expect(myInfoPage.emailHeading).toBeVisible();
  await myInfoPage.enterInvalidWorkEmailWithoutSaving(badEmail);
});

Then('Contact Details should display inline validation {string}', async ({ myInfoPage }, expectedError) => {
  await expect(myInfoPage.inlineErrors.filter({ hasText: expectedError }).first()).toBeVisible();
});

When('I open Emergency Contacts and submit the Add form with blank required fields', async ({ myInfoPage }) => {
  await myInfoPage.openEmergencyContactsTab();
  await expect(myInfoPage.emergencyContactsHeading).toBeVisible();
  await myInfoPage.openAndSubmitBlankEmergencyContact();
});

Then('Emergency Contacts should display inline {string} validation and cancel cleanly', async ({ myInfoPage }, expectedError) => {
  await expect(myInfoPage.inlineErrors.filter({ hasText: expectedError }).first()).toBeVisible();
  await myInfoPage.cancelEmergencyContactForm();
});
