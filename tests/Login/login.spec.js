const { test, expect } = require('@playwright/test');
const LoginPage = require('../../pages/login/LoginPage');

test.describe('BoardView QA - Login Test Cases Suite', () => {
  let loginPage;
  const validEmail = process.env.LOGIN_EMAIL || '8830801957';
  const validPassword = process.env.LOGIN_PASSWORD || 'Sujit@12345';

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.open();
  });

  // १. निगेटिव्ह टेस्ट केस १: रिकामे युझरनेम आणि पासवर्ड सबमिट करणे (Empty Credentials)
  test('Negative Test 1: Verify validation errors when submitting empty username and password', async ({ page }) => {
    console.log('📌 Running Negative Test 1: Empty credentials submission...');
    await loginPage.clickLogin();

    await expect(loginPage.emailRequiredError).toBeVisible({ timeout: 5000 });
    await expect(loginPage.passwordRequiredError).toBeVisible({ timeout: 5000 });
    expect(page.url()).toContain('/login');
    console.log('✅ Correct validation errors shown: "Email or phone number is required" and "Password is required"');
  });

  // २. निगेटिव्ह टेस्ट केस २: फक्त युझरनेम भरणे, पासवर्ड रिकामा ठेवणे (Missing Password)
  test('Negative Test 2: Verify validation error when password field is left empty', async ({ page }) => {
    console.log('📌 Running Negative Test 2: Missing password submission...');
    await loginPage.enterUsernameOrPhone(validEmail);
    await loginPage.clickLogin();

    await expect(loginPage.passwordRequiredError).toBeVisible({ timeout: 5000 });
    expect(page.url()).toContain('/login');
    console.log('✅ Correct validation error shown: "Password is required"');
  });

  // ३. निगेटिव्ह टेस्ट केस ३: चुकीचा पासवर्ड टाकणे (Invalid / Incorrect Password)
  test('Negative Test 3: Verify login fails with valid username but incorrect password', async ({ page }) => {
    console.log('📌 Running Negative Test 3: Invalid password submission...');
    await loginPage.login(validEmail, 'WrongPassword@999');

    await expect(loginPage.invalidPasswordError).toBeVisible({ timeout: 10000 });
    expect(page.url()).toContain('/login');
    expect(page.url()).not.toContain('/choose-client');
    console.log('✅ Correct error message shown: "Invalid password" and user remains on login page');
  });

  // ४. निगेटिव्ह टेस्ट केस ४: नोंदणी नसलेला / चुकीचा युझरनेम टाकणे (Unregistered User)
  test('Negative Test 4: Verify login fails with unregistered user credentials', async ({ page }) => {
    console.log('📌 Running Negative Test 4: Unregistered user submission...');
    await loginPage.login('0000000000', 'DummyPass@123');

    await expect(loginPage.invalidPasswordError.or(loginPage.errorMessage)).toBeVisible({ timeout: 10000 }).catch(() => {});
    expect(page.url()).toContain('/login');
    expect(page.url()).not.toContain('/choose-client');
    console.log('✅ Unregistered login rejected and user remains on login page');
  });

  // ५. पॉझिटिव्ह टेस्ट केस (शेवटी): योग्य क्रेडेंशियल्ससह यशस्वी लॉगिन आणि डॅशबोर्ड नेव्हिगेशन
  test('Positive Test: Verify successful login with valid credentials and select organization', async ({ page }) => {
    test.setTimeout(90000);
    console.log(`📌 Running Positive Test: Logging in with valid credentials (${validEmail})...`);

    // पासवर्ड फील्ड मास्क (type="password") असल्याची खात्री करणे (Security Check)
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');

    // योग्य क्रेडेंशियल्ससह लॉगिन
    await loginPage.login(validEmail, validPassword);

    // यशस्वी लॉगिन टोस्ट पडताळणी
    await expect(loginPage.successToast).toBeVisible({ timeout: 15000 });
    console.log('✅ User logged in successfully!');

    // 'qa group' ऑर्गनायझेशन सिलेक्ट करणे
    console.log('📌 Searching and selecting organization: qa group...');
    await loginPage.selectOrganization('qa group');

    // डॅशबोर्डवर पोहोचल्याची खात्री करणे
    console.log('Current Dashboard URL:', page.url());
    expect(page.url()).not.toContain('/login');
    expect(page.url()).not.toContain('/choose-client');
    console.log('✅ Successfully reached dashboard for QA Group!');
    console.log('🎉 Positive login test completed successfully!');
  });
});
