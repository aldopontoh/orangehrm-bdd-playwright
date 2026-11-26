const { BasePage } = require('./BasePage');
const { clearAndFill } = require('../utils/uiHelpers');

class RecruitmentPage extends BasePage {
  constructor(page, credentials = null) {
    super(page, credentials);
    this.candidatesHeading = page.getByRole('heading', { name: 'Candidates', level: 5 });
    this.addCandidateHeading = page.getByRole('heading', { name: 'Add Candidate', level: 6 });
    this.applicationStageHeading = page.getByRole('heading', { name: 'Application Stage', level: 6 });
    this.vacanciesHeading = page.getByRole('heading', { name: 'Vacancies', level: 5 });
    this.addVacancyHeading = page.getByRole('heading', { name: 'Add Vacancy', level: 6 });

    this.vacanciesTab = page.getByRole('link', { name: 'Vacancies', exact: true });
    this.candidatesTab = page.getByRole('link', { name: 'Candidates', exact: true });
    this.addButton = page.getByRole('button', { name: 'Add' });
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.resetButton = page.getByRole('button', { name: 'Reset' });
    this.saveButton = page.getByRole('button', { name: 'Save' });

    this.firstNameInput = page.getByPlaceholder('First Name');
    this.middleNameInput = page.getByPlaceholder('Middle Name');
    this.lastNameInput = page.getByPlaceholder('Last Name');
    this.resumeFileInput = page.locator('input[type="file"]');
    this.keywordsInput = page.getByPlaceholder('Enter comma seperated words...');
    this.consentCheckbox = page.locator('.oxd-checkbox-input');
  }

  async openCandidates(credentials = this.credentials) {
    await this.gotoPath('/web/index.php/recruitment/viewCandidates', credentials);
    await this.candidatesHeading.waitFor({ state: 'visible' });
  }

  async openAddCandidate(credentials = this.credentials) {
    await this.gotoPath('/web/index.php/recruitment/addCandidate', credentials);
    await this.addCandidateHeading.waitFor({ state: 'visible' });
  }

  async openVacancies(credentials = this.credentials) {
    await this.gotoPath('/web/index.php/recruitment/viewJobVacancy', credentials);
    await this.vacanciesHeading.waitFor({ state: 'visible' });
  }

  async openAddVacancyFromGrid() {
    await this.addButton.click();
    await this.waitForSpinnerToDisappear();
    await this.addVacancyHeading.waitFor({ state: 'visible' });
  }

  async createCandidate(candidate) {
    await this.openAddCandidate();
    await clearAndFill(this.firstNameInput, candidate.firstName);
    if (candidate.middleName) {
      await clearAndFill(this.middleNameInput, candidate.middleName);
    }
    await clearAndFill(this.lastNameInput, candidate.lastName);
    await this.fillInputByLabel('Email', candidate.email);
    await this.fillInputByLabel('Contact Number', candidate.contactNumber);

    if (candidate.resumeFile) {
      await this.resumeFileInput.setInputFiles(candidate.resumeFile);
    }
    if (candidate.keywords) {
      await clearAndFill(this.keywordsInput, candidate.keywords);
    }
    if (candidate.notes) {
      await this.getFormGroup('Notes').locator('textarea').fill(candidate.notes);
    }
    await this.consentCheckbox.click();
    await this.saveButton.click();
    await this.waitForToast();
    await this.page.waitForURL(/\/web\/index\.php\/recruitment\/addCandidate\/\d+/, {
      timeout: 30_000,
    });
    await this.waitForSpinnerToDisappear();
    await this.applicationStageHeading.waitFor({ state: 'visible' });
  }

  async searchCandidateByName(firstName) {
    await this.selectAutocompleteOption('Candidate Name', firstName, firstName);
    await Promise.all([
      this.page
        .waitForResponse(
          (res) => res.url().includes('/api/v2/recruitment/candidates') && res.status() === 200,
          { timeout: 15_000 }
        )
        .catch(() => {}),
      this.searchButton.click(),
    ]);
    await this.waitForSpinnerToDisappear();
  }

  getCandidateRowByName(nameFragment) {
    return this.tableCards.filter({ hasText: nameFragment }).first();
  }

  async deleteCandidateByName(firstName, fullName, credentials = null) {
    if (!firstName || !firstName.startsWith('AutoQA_')) {
      return false;
    }
    await this.openCandidates(credentials);
    try {
      await this.searchCandidateByName(firstName, fullName);
    } catch {
      return false;
    }
    const row = this.getCandidateRowByName(firstName);
    if ((await row.count()) === 0) {
      return false;
    }
    await row.locator('button:has(.bi-trash)').first().click();
    const toastText = await this.confirmModalDelete();
    return { deleted: true, toastText };
  }
}

module.exports = { RecruitmentPage };
