const { test, expect } = require('@playwright/test');
const LoginPage = require('../../pages/login/LoginPage');
const MenuPage = require('../../pages/menu/MenuPage');

test.describe('BoardView QA Menu Module Tests', () => {
  test('Complete Menu Flow: Verify Sidebar Navigation, Search Input, and Applications Module', async ({ page }) => {
    test.setTimeout(90000);

    const loginPage = new LoginPage(page);
    const menuPage = new MenuPage(page);

    // १. लॉगिन करणे (फक्त एकदाच)
    console.log('📌 Step 1: Logging in and selecting organization (Single Session)...');
    await loginPage.loginAndSelectOrganization(
      process.env.LOGIN_EMAIL || '8830801957',
      process.env.LOGIN_PASSWORD || 'Sujit@12345',
      'qa group'
    );

    // २. डॅशबोर्डवरील साइडबार मेनू आयटम्स तपासणे
    console.log('📌 Step 2: Verifying sidebar menu items...');
    await expect(menuPage.welcomeMenuItem).toBeVisible({ timeout: 15000 });
    await expect(menuPage.boardsMenuItem).toBeVisible({ timeout: 10000 });
    await expect(menuPage.applicationsMenuItem).toBeVisible({ timeout: 10000 });
    await expect(menuPage.pagesMenuItem).toBeVisible({ timeout: 10000 });
    console.log('✅ All key sidebar menu items verified successfully!');

    // ३. मेनू सर्च बॉक्समध्ये सर्च करून पाहणे
    console.log('📌 Step 3: Testing menu search input with "CRM"...');
    await menuPage.searchMenu('CRM');
    console.log('✅ Menu search input is functional!');

    // ४. Applications मॉड्युलवर क्लिक करणे
    console.log('📌 Step 4: Clicking on Applications module...');
    await menuPage.clickApplications();
    await page.waitForTimeout(500);
    console.log('✅ Successfully clicked on Applications module!');

    console.log('🎉 Menu test suite completed successfully in 1 single run!');
  });
});
