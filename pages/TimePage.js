const { BasePage } = require('./BasePage');
const { clearAndFill, formatDateForPlaceholder } = require('../utils/uiHelpers');

function formatLocal12HourTime(dateObj) {
  const localH24 = dateObj.getHours();
  const localM = dateObj.getMinutes();
  const period = localH24 >= 12 ? 'PM' : 'AM';
  const localH12 = localH24 % 12 === 0 ? 12 : localH24 % 12;
  return `${String(localH12).padStart(2, '0')}:${String(localM).padStart(2, '0')} ${period}`;
}

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

  async openEmployeeTimesheets(credentials = this.credentials) {
    await this.gotoPath('/web/index.php/time/viewEmployeeTimesheet', credentials);
    await this.selectEmployeeHeading.waitFor({ state: 'visible' });
  }

  async openMyTimesheet(credentials = this.credentials) {
    await this.gotoPath('/web/index.php/time/viewMyTimesheet', credentials);
    await this.myTimesheetHeading.waitFor({ state: 'visible' });
  }

  async openAttendancePunch(credentials = this.credentials) {
    await this.gotoPath('/web/index.php/attendance/punchIn', credentials);
    await this.punchHeading.waitFor({ state: 'visible' });
  }

  async getCurrentPunchHeadingText() {
    return ((await this.punchHeading.textContent()) || '').trim();
  }

  async setDateAndTime(dateObj, timeStr = null) {
    const dateInput = this.getFormGroup('Date').locator('input').first();
    const datePlaceholder = (await dateInput.getAttribute('placeholder')) || 'yyyy-dd-mm';
    const formattedDate = formatDateForPlaceholder(dateObj, datePlaceholder);
    await clearAndFill(dateInput, formattedDate);
    // Click heading to dismiss any open OXD calendar popover and trigger blur validation
    await this.punchHeading.click();

    if (timeStr) {
      const timeInput = this.getFormGroup('Time').locator('input').first();
      await clearAndFill(timeInput, timeStr);
      // Click heading to dismiss any open OXD timepicker popover so it never absorbs Submit click
      await this.punchHeading.click();
    }

    await this.inlineErrors
      .first()
      .waitFor({ state: 'hidden', timeout: 5_000 })
      .catch(() => {});
  }

  async submitAttendancePunch(noteText) {
    const beforeState = await this.getCurrentPunchHeadingText();
    const expectedNextHeading = beforeState === 'Punch In' ? 'Punch Out' : 'Punch In';
    const nextHeadingLocator = this.page.getByRole('heading', {
      name: expectedNextHeading,
      level: 6,
    });
    await this.punchNoteTextarea.fill(noteText);

    const trySubmit = async () => {
      // Do not click Submit if inline validation is already showing
      if (await this.inlineErrors.first().isVisible().catch(() => false)) {
        return false;
      }
      await this.punchActionButton.click();
      const result = await Promise.race([
        this.toastContainer
          .first()
          .waitFor({ state: 'visible', timeout: 25_000 })
          .then(() => 'success')
          .catch(() => null),
        nextHeadingLocator
          .waitFor({ state: 'visible', timeout: 25_000 })
          .then(() => 'success')
          .catch(() => null),
        this.inlineErrors
          .first()
          .waitFor({ state: 'visible', timeout: 8_000 })
          .then(() => 'error')
          .catch(() => null),
      ]);
      await this.waitForSpinnerToDisappear();
      if (result === 'success') {
        await nextHeadingLocator.waitFor({ state: 'visible', timeout: 25_000 }).catch(() => {});
        return true;
      }
      const currentHeading = await this.getCurrentPunchHeadingText().catch(() => beforeState);
      return currentHeading === expectedNextHeading;
    };

    // Attempt 1: default current Date & Time (if no pre-existing validation error)
    if (await trySubmit()) {
      return beforeState;
    }

    // Attempt 2 (Punch Out recovery): compute exact UTC Punch-In + 1 minute in browser local timezone
    if (beforeState === 'Punch Out') {
      try {
        const res = await this.page.request.get('/web/index.php/api/v2/attendance/records/latest');
        if (res.ok()) {
          const json = await res.json();
          const pIn = json && json.data && json.data.punchIn;
          if (pIn && pIn.utcDate && pIn.utcTime) {
            const punchInUtc = new Date(`${pIn.utcDate}T${pIn.utcTime}:00Z`);
            if (!Number.isNaN(punchInUtc.getTime())) {
              const target = new Date(punchInUtc.getTime() + 60_000);
              await this.setDateAndTime(target, formatLocal12HourTime(target));
              if (await trySubmit()) {
                return beforeState;
              }
            }
          }
        }
      } catch {
        // Fall through to date offsets
      }
    }

    // Attempt 3 (Punch In overlap recovery): jump past any shared-demo records on today's date
    for (const dayOffset of [2, 10, 30, 60]) {
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + dayOffset);
      await this.setDateAndTime(nextDate);
      if (await trySubmit()) {
        return beforeState;
      }
    }

    // Final fallback so any genuine failure surfaces clearly
    await this.waitForToast();
    await this.waitForSpinnerToDisappear();
    return beforeState;
  }
}

module.exports = { TimePage };
