const { BasePage } = require('./BasePage');
const { gotoWithNetworkRetry } = require('../utils/uiHelpers');

class LoginPage extends BasePage {
  constructor(page, credentials = null) {
    super(page, credentials);
    this.loginHeading = page.getByRole('heading', { name: 'Login', level: 5 });
    this.usernameInput = page.locator('input[name="username"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.loginButton = page.locator('button[type="submit"]');
    this.csrfTokenInput = page.locator('input[name="_token"]');
    this.errorAlert = page.getByRole('alert');
    this.forgotPasswordLink = page.getByText('Forgot your password?');
    this.resetPasswordHeading = page.getByRole('heading', { name: 'Reset Password', level: 6 });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
  }

  async openAsGuest() {
    await this.page.context().clearCookies();
    await gotoWithNetworkRetry(this.page, '/web/index.php/auth/login');
    await this.usernameInput.waitFor({ state: 'visible' });
  }

  async login(username, password) {
    if (username !== undefined && username !== null) {
      await this.usernameInput.fill(username);
    }
    if (password !== undefined && password !== null) {
      await this.passwordInput.fill(password);
    }
    await this.loginButton.click();
  }

  async openForgotPassword() {
    await this.forgotPasswordLink.click();
    await this.resetPasswordHeading.waitFor({ state: 'visible' });
  }

  async cancelResetPassword() {
    await this.cancelButton.click();
    await this.loginHeading.waitFor({ state: 'visible' });
  }
}

module.exports = { LoginPage };
