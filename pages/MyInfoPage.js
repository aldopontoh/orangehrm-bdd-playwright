const { BasePage } = require('./BasePage');

class MyInfoPage extends BasePage {
  constructor(page, credentials = null) {
    super(page, credentials);
    this.personalDetailsHeading = page.getByRole('heading', { name: 'Personal Details', level: 6 });
    this.contactDetailsHeading = page.getByRole('heading', { name: 'Contact Details', level: 6 });
    this.addressHeading = page.getByRole('heading', { name: 'Address', level: 6 });
    this.telephoneHeading = page.getByRole('heading', { name: 'Telephone', level: 6 });
    this.emailHeading = page.getByRole('heading', { name: 'Email', level: 6 });
    this.emergencyContactsHeading = page.getByRole('heading', {
      name: 'Assigned Emergency Contacts',
      level: 6,
    });

    this.personalDetailsTab = page.getByRole('link', { name: 'Personal Details', exact: true });
    this.contactDetailsTab = page.getByRole('link', { name: 'Contact Details', exact: true });
    this.emergencyContactsTab = page.getByRole('link', { name: 'Emergency Contacts', exact: true });
    this.jobTab = page.getByRole('link', { name: 'Job', exact: true });

    this.firstNameInput = page.getByPlaceholder('First Name');
    this.lastNameInput = page.getByPlaceholder('Last Name');
    this.emergencyAddButton = page
      .locator('.orangehrm-action-header', { hasText: 'Assigned Emergency Contacts' })
      .getByRole('button', { name: 'Add' });
    this.saveButton = page.getByRole('button', { name: 'Save' }).first();
    this.cancelButton = page.getByRole('button', { name: 'Cancel' }).first();
  }

  async openMyInfo(credentials = this.credentials) {
    await this.gotoPath('/web/index.php/pim/viewMyDetails', credentials);
    await this.personalDetailsHeading.waitFor({ state: 'visible' });
  }

  async openContactDetailsTab() {
    await this.clickNavigationLink(this.contactDetailsTab);
    await this.contactDetailsHeading.waitFor({ state: 'visible' });
  }

  async openEmergencyContactsTab() {
    await this.clickNavigationLink(this.emergencyContactsTab);
    await this.emergencyContactsHeading.waitFor({ state: 'visible' });
  }

  async enterInvalidWorkEmailWithoutSaving(invalidEmail) {
    const workEmailInput = this.getFormGroup('Work Email').locator('input').first();
    await workEmailInput.click();
    await workEmailInput.press('ControlOrMeta+a');
    await workEmailInput.fill(invalidEmail);
    await workEmailInput.press('Tab');
  }

  async openAndSubmitBlankEmergencyContact() {
    await this.emergencyAddButton.click();
    await this.saveButton.waitFor({ state: 'visible' });
    await this.saveButton.click();
  }

  async cancelEmergencyContactForm() {
    if (await this.cancelButton.isVisible().catch(() => false)) {
      await this.cancelButton.click();
    }
  }
}

module.exports = { MyInfoPage };
