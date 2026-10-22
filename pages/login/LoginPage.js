const { expect } = require('@playwright/test');

/**
 * LoginPage - BoardView लॉगिन पेज ऑब्जेक्ट मॉडेल
 * वापरकर्त्याने दिलेल्या नेमक्या DOM घटकांवर (Exact Locators) आधारित
 */
class LoginPage {
  /**
   * @param page
   */
  constructor(page) {
    this.page = page;

    // यूजरने दिलेल्या अचूक HTML नुसार लोकेटर्स:
    this.usernameInput = page.locator('input.loginInput[placeholder="Enter email or phone number"]');
    this.passwordInput = page.locator('input.loginInput[placeholder="Enter Password"]');
    this.loginButton = page.locator('button.loginBtnPrimary');
    this.passwordToggleBtn = page.locator('input[placeholder="Enter Password"] ~ button, .lucide-eye, .lucide-eye-off').first();
    this.acceptCookiesBtn = page.getByRole('button', { name: 'Accept' });
    this.successToast = page.getByText(/User logged in successfully|Welcome/i);
    this.errorMessage = page.locator('.error, .toast-error, [role="alert"], .alert-danger').first();

    // एरर व व्हॅलिडेशन लोकेटर्स (Negative Test Cases साठी):
    this.emailRequiredError = page.getByText(/Email or phone number is required/i);
    this.passwordRequiredError = page.getByText(/Password is required/i);
    this.invalidPasswordError = page.getByText(/Invalid password/i);

    // Choose Organization (Choose Client) लोकेटर्स:
    this.orgSearchInput = page.locator('input[name="workspace-search"], input[placeholder="Search Organizations"]');
  }

  /**
   * लॉगिन पेज उघडणे
   * @param {string} [url]
   */
  async open(url = process.env.BASE_URL || 'https://qa.boardview.me/login') {
    await this.page.goto(url, { waitUntil: 'load' });
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.handleCookiesBanner();
  }

  /**
   * कुकी बॅनर आल्यास स्वीकारणे
   */
  async handleCookiesBanner() {
    try {
      if (await this.acceptCookiesBtn.isVisible({ timeout: 2500 }).catch(() => false)) {
        await this.acceptCookiesBtn.click();
        await this.page.waitForTimeout(500);
      }
    } catch (e) {
      // बॅनर नसेल तर दुर्लक्ष करा
    }
  }

  /**
   * ईमेल किंवा फोन नंबर टाकणे
   * @param {string} usernameOrPhone
   */
  async enterUsernameOrPhone(usernameOrPhone) {
    await expect(this.usernameInput).toBeVisible({ timeout: 30000 });
    await this.usernameInput.fill(usernameOrPhone);
  }

  /**
   * पासवर्ड टाकणे
   * @param {string} password
   */
  async enterPassword(password) {
    await expect(this.passwordInput).toBeVisible({ timeout: 20000 });
    await this.passwordInput.fill(password);
  }

  /**
   * लॉगिन बटणावर क्लिक करणे
   */
  async clickLogin() {
    await this.handleCookiesBanner();
    await expect(this.loginButton).toBeVisible({ timeout: 10000 });
    await this.loginButton.click();
  }

  /**
   * थेट संपूर्ण लॉगिन करणे
   * @param {string} usernameOrPhone
   * @param {string} password
   */
  async login(usernameOrPhone, password) {
    await this.enterUsernameOrPhone(usernameOrPhone);
    await this.enterPassword(password);
    await this.clickLogin();
  }

  /**
   * इनपुट फील्ड्स रिकामे करणे
   */
  async clearFields() {
    await this.usernameInput.clear();
    await this.passwordInput.clear();
  }

  /**
   * डॅशबोर्डवर जाणे - IF / ELSE वापरून ऑर्गनायझेशन तपासणे:
   * IF: जर 'choose-client' (ऑर्गनायझेशन स्क्रीन) असेल तर ऑर्गनायझेशन शोधून सिलेक्ट करणे.
   * ELSE IF: जर आधीच डॅशबोर्ड किंवा welcome स्क्रीनवर असेल तर थेट पुढे जाणे.
   * ELSE: थेट डॅशबोर्ड नेव्हिगेशनची वाट पाहणे.
   * @param {string} [orgName]
   */
  async selectOrganization(orgName = 'qa group') {
    // १. जर अजूनही /login वर असेल तर रिडायरेक्ट होण्याची वाट पाहणे
    if (this.page.url().includes('/login')) {
      await this.page.waitForURL(
        url => !url.toString().includes('/login'),
        { timeout: 30000 }
      ).catch(() => {});
    }

    // २. choose-client किंवा welcome स्क्रीन येण्याची वाट पाहणे
    await this.page.waitForURL(/choose-client|welcome/, { timeout: 20000 }).catch(() => {});
    const currentUrl = this.page.url();

    // 1. IF: जर 'choose-client' स्क्रीनवर असेल, तर ऑर्गनायझेशन शोधून सिलेक्ट करणे
    if (currentUrl.includes('/choose-client')) {
      console.log(`🏢 Organization screen detected. Searching & selecting "${orgName}"...`);

      // जर 'Failed to fetch tenants' किंवा 'Retry' बटण दिसले तर त्यावर क्लिक करणे
      const retryBtn = this.page.getByRole('button', { name: /Retry/i }).or(this.page.locator('button:has-text("Retry")'));
      if (await retryBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log('🔄 "Failed to fetch tenants" detected, clicking Retry...');
        await retryBtn.click();
        await this.page.waitForTimeout(1500);
      }

      // सर्च इनपुट येण्याची वाट पाहणे
      await this.orgSearchInput.waitFor({ state: 'visible', timeout: 20000 });
      await this.orgSearchInput.click();
      await this.orgSearchInput.clear();
      await this.orgSearchInput.fill(orgName);

      // ऑर्गनायझेशन कार्ड शोधणे (Playwright auto-waiting सह)
      const orgCard = this.page.locator('button, [role="button"]')
        .filter({ hasText: new RegExp(orgName, 'i') })
        .first();

      console.log(`⏳ Waiting for organization "${orgName}" card to appear...`);
      try {
        await orgCard.waitFor({ state: 'visible', timeout: 20000 });
        console.log(`🖱️ Clicking organization card for "${orgName}"...`);
        await orgCard.click();
      } catch (err) {
        console.log(`⚠️ orgCard direct wait failed, trying getByRole...`);
        const roleBtn = this.page.getByRole('button', { name: new RegExp(orgName, 'i') }).first();
        if (await roleBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
          console.log(`🖱️ Clicking role button for "${orgName}"...`);
          await roleBtn.click();
        } else {
          const textMatch = this.page.getByText(new RegExp(orgName, 'i')).first();
          await textMatch.waitFor({ state: 'visible', timeout: 10000 });
          await textMatch.click({ force: true });
        }
      }

      // डॅशबोर्डवर नेव्हिगेट होण्याची वाट पाहणे (/choose-client सोडून जाणे)
      if (this.page.url().includes('/choose-client')) {
        await this.page.waitForURL(
          url => !url.toString().includes('/choose-client'),
          { timeout: 25000 }
        ).catch(() => {});
      }

      // जर अजूनही choose-client वरच अडकले असेल तर पुन्हा एकदा क्लिक करणे
      if (this.page.url().includes('/choose-client')) {
        console.log(`⚠️ Still on choose-client, retrying click on "${orgName}"...`);
        if (await orgCard.isVisible().catch(() => false)) {
          await orgCard.click({ force: true }).catch(() => {});
        }
        await this.page.waitForURL(
          url => !url.toString().includes('/choose-client'),
          { timeout: 20000 }
        ).catch(() => {});
      }

      await this.page.waitForLoadState('networkidle').catch(() => {});
      console.log('✅ Dashboard reached:', this.page.url());

    } else if (currentUrl.includes('/welcome') || (!currentUrl.includes('/login') && !currentUrl.includes('/choose-client'))) {
      // 2. ELSE IF: आधीच डॅशबोर्ड किंवा welcome स्क्रीनवर पोहोचल्यास
      console.log('🚀 Already on dashboard:', currentUrl);

    } else {
      // 3. ELSE: अजूनही रिडायरेक्ट होत असल्यास वाट पाहणे
      console.log('⏳ Waiting for dashboard redirect from:', currentUrl);
      await this.page.waitForURL(/welcome/, { timeout: 25000 }).catch(() => {});
      console.log('✅ Current URL:', this.page.url());
    }
  }

  /**
   * Reusable Helper: संपूर्ण लॉगिन आणि ऑर्गनायझेशन सिलेक्शन एकाच कॉलमध्ये करणे
   * @param {string} usernameOrPhone
   * @param {string} password
   * @param {string} [orgName]
   */
  async loginAndSelectOrganization(usernameOrPhone, password, orgName = 'qa group') {
    await this.open();
    await this.login(usernameOrPhone, password);
    await this.selectOrganization(orgName);
  }
}

module.exports = LoginPage;
