/**
 * Deterministic OrangeHRM OXD Vue.js UI utilities.
 * Strictly event-driven and state-based synchronization (no fixed sleeps).
 */

async function waitForSpinnersToDisappear(page, timeout = 20_000) {
  const spinners = page.locator('.oxd-loading-spinner, .oxd-form-loader');
  await spinners.first().waitFor({ state: 'hidden', timeout }).catch(() => {});
  // Wait until zero visible spinners remain
  await page
    .waitForFunction(
      () => {
        const nodes = document.querySelectorAll('.oxd-loading-spinner, .oxd-form-loader');
        return [...nodes].every((el) => {
          const style = window.getComputedStyle(el);
          return style.display === 'none' || style.visibility === 'hidden' || el.offsetParent === null;
        });
      },
      null,
      { timeout }
    )
    .catch(() => {});
}

async function clearAndFill(locator, value) {
  await locator.waitFor({ state: 'visible' });
  await locator.click();
  await locator.press('ControlOrMeta+a');
  await locator.press('Backspace');
  if (value !== '') {
    await locator.fill(String(value));
  }
}

/**
 * Formats a Date object dynamically based on OrangeHRM's live date placeholder
 * (`yyyy-dd-mm` vs `yyyy-mm-dd`).
 */
function formatDateForPlaceholder(dateObj, placeholder = 'yyyy-dd-mm') {
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  const normalized = (placeholder || 'yyyy-dd-mm').trim().toLowerCase();

  if (normalized === 'yyyy-mm-dd') {
    return `${yyyy}-${mm}-${dd}`;
  }
  return `${yyyy}-${dd}-${mm}`;
}

/**
 * Returns a future weekday (Monday-Friday) N+ days ahead to avoid weekend leave errors.
 */
function getFutureWeekday(minDaysAhead = 5) {
  const d = new Date();
  d.setDate(d.getDate() + minDaysAhead);
  while (d.getDay() === 0 || d.getDay() === 6) {
    d.setDate(d.getDate() + 1);
  }
  return d;
}

/**
 * Ensures the shared OrangeHRM demo sandbox is set to English (en_US)
 * while preserving the active dateFormat. Uses the authenticated session cookie.
 * Returns true if the language was changed and a reload is needed.
 */
async function ensureEnglishLocale(page) {
  try {
    const getRes = await page.request.get('/web/index.php/api/v2/admin/localization');
    if (!getRes.ok()) {
      return false;
    }
    const payload = await getRes.json();
    const current = payload && payload.data ? payload.data : {};
    if (current.language === 'en_US') {
      return false;
    }

    const putRes = await page.request.put('/web/index.php/api/v2/admin/localization', {
      data: {
        language: 'en_US',
        dateFormat: current.dateFormat || 'Y-d-m',
      },
    });
    return putRes.ok();
  } catch {
    return false;
  }
}

async function gotoWithNetworkRetry(page, url, options = { waitUntil: 'domcontentloaded' }) {
  try {
    return await page.goto(url, options);
  } catch (err) {
    const msg = String(err && err.message ? err.message : err);
    if (
      msg.includes('ERR_NETWORK_CHANGED') ||
      msg.includes('ERR_CONNECTION_RESET') ||
      msg.includes('ERR_ABORTED')
    ) {
      return await page.goto(url, options);
    }
    throw err;
  }
}

module.exports = {
  waitForSpinnersToDisappear,
  clearAndFill,
  formatDateForPlaceholder,
  getFutureWeekday,
  ensureEnglishLocale,
  gotoWithNetworkRetry,
};
