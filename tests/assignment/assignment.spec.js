const { test, expect } = require('@playwright/test');
const LoginPage = require('../../pages/login/LoginPage');
const MenuPage = require('../../pages/menu/MenuPage');
const AssignmentPage = require('../../pages/assignment/AssignmentPage');

test.describe('BoardView QA - School Management Assignment Module Tests', () => {
  let loginPage;
  let menuPage;
  let assignmentPage;

  test.beforeEach(async ({ page }) => {
    test.setTimeout(180000);

    loginPage = new LoginPage(page);
    menuPage = new MenuPage(page);
    assignmentPage = new AssignmentPage(page);

    // १. लॉगिन करणे व 'qa group' सिलेक्ट करणे (Single call)
    await loginPage.loginAndSelectOrganization(
      process.env.LOGIN_EMAIL || '8830801957',
      process.env.LOGIN_PASSWORD || 'Sujit@12345',
      'qa group'
    );

    // २. Applications -> School Management -> Assignment उघडणे
    await menuPage.clickAssignment();
    await assignmentPage.clickAssignmentsSubItem();
  });

  // १. निगेटिव्ह टेस्ट केस १: Title व Description काहीही न भरता थेट Save करणे (Empty Fields Validation)
  test('Negative Test 1: Verify validation error when saving assignment with empty title and description', async ({ page }) => {
    console.log('📌 Running Negative Test 1: Empty assignment creation validation...');
    await assignmentPage.clickAddAssignment();

    // रिकामे असताना थेट Save बटणावर क्लिक करणे (ड्रॉवर बंद होण्याची वाट न पाहणे)
    await assignmentPage.clickSave(false);

    // 'Title is required' एरर दिसल्याची खात्री करणे
    await expect(assignmentPage.titleRequiredError).toBeVisible({ timeout: 10000 });
    // ड्रॉवर अजूनही उघडा असल्याची खात्री (असाइनमेंट सेव्ह झाली नाही)
    await expect(page.getByRole('heading', { name: 'Create Assignment' })).toBeVisible();
    console.log('✅ Validation verified: "Title is required" is displayed and empty assignment is prevented from saving!');

    // ड्रॉवर बंद करणे
    await assignmentPage.clickCancel();
  });

  // २. निगेटिव्ह टेस्ट केस २: Title भरले पण कोणत्याही User ला सिलेक्ट न करता Save करणे (Missing User Selection)
  test('Negative Test 2: Verify validation error when saving assignment without selecting user', async ({ page }) => {
    console.log('📌 Running Negative Test 2: Missing user assignment validation...');
    await assignmentPage.clickAddAssignment();

    // फक्त Title आणि Description भरणे पण युझर सिलेक्ट न करणे
    await assignmentPage.fillAssignmentDetails('Assignment', 'Assignment');
    await assignmentPage.clickSave(false);

    // युझर सिलेक्ट न केल्याचा एरर / व्हॅलिडेशन तपासणे
    await expect(assignmentPage.userRequiredError).toBeVisible({ timeout: 10000 });
    // ड्रॉवर अजूनही उघडा असल्याची खात्री (असाइनमेंट सेव्ह झाली नाही)
    await expect(page.getByRole('heading', { name: 'Create Assignment' })).toBeVisible();
    console.log('✅ Validation verified: "Please select at least one filter" error toast displayed and assignment cannot be saved without user!');

    // ड्रॉवर बंद करणे
    await assignmentPage.clickCancel();
  });

  // ३. View Submitted Assignments (id="assignment-view") बटणावर थेट क्लिक करणे
  test('View Submitted Assignments: Verify clicking button id="assignment-view" opens View Submitted Assignments', async ({ page }) => {
    console.log('📌 Clicking View Submitted Assignments button (id="assignment-view")...');
    await assignmentPage.clickViewSubmittedAssignments();
    expect(page.url()).toContain('assignment-view');
    console.log('✅ Successfully clicked id="assignment-view" and opened View Submitted Assignments!');
  });

  // ४. पॉझिटिव्ह टेस्ट केस (शेवटी): संपूर्ण यशस्वी असाइनमेंट तयार, सबमिट आणि व्ह्यू करणे
  test('Positive Test: Complete Assignment Flow - Create, Submit with Note & Upload, and View', async ({ page }) => {
    console.log('📌 Running Positive Test: Complete assignment creation and submission flow...');

    // १. id="assignment-add" (+ Add Assignment) बटणावर क्लिक करणे
    await assignmentPage.clickAddAssignment();

    // २. Title आणि Description (id="assignment-create-description") भरणे (Duplicate / Same Content)
    const assignmentTitle = 'Assignment';
    const assignmentDescription = 'Assignment';
    console.log(`📌 Step 2: Filling details - Title: "${assignmentTitle}", Description: "${assignmentDescription}"...`);
    await assignmentPage.fillAssignmentDetails(
      assignmentTitle,
      assignmentDescription
    );

    // ३. id="assignment-create-tab-user" (User tab) वर क्लिक करणे
    console.log('📌 Step 3: Selecting User tab...');
    await assignmentPage.clickUserTab();

    // ४. id="assignment-create-user-search" वर क्लिक करून 'sujit shirsath' सर्च आणि सिलेक्ट करणे
    console.log('📌 Step 4: Searching & selecting user "sujit shirsath"...');
    await assignmentPage.searchAndSelectUser('sujit shirsath');

    // ५. id="assignment-create-save" वर क्लिक करून सेव्ह करणे
    console.log('📌 Step 5: Saving created assignment...');
    await assignmentPage.clickSave();
    await page.waitForTimeout(2000);

    // ६. id="assignment-my" (My Assignments) वर क्लिक करणे
    console.log('📌 Step 6: Navigating to My Assignments...');
    await assignmentPage.clickMyAssignments();
    await page.waitForTimeout(1000);

    // ७. टेबलमधील Submit बटणावर क्लिक करून सबमिशन ड्रॉवर उघडणे (नवीन तयार केलेली असाइनमेंट)
    console.log(`📌 Step 7: Clicking Submit button for newly created assignment "${assignmentTitle}"...`);
    await assignmentPage.clickSubmitAssignment(assignmentTitle);
    await page.waitForTimeout(1500);

    // ८. id="assignment-submission-comment" मध्ये "good task" टाकणे
    console.log('📌 Step 8: Entering submission note "good task"...');
    await assignmentPage.fillSubmissionComment('good task');

    // ९. id="assignment-submission-upload" द्वारे युनिक इमेज अपलोड करणे
    console.log('📌 Step 9: Uploading unique image file...');
    const uploadedFile = await assignmentPage.uploadSubmissionImage();

    // १०. id="assignment-submission-submit" वर क्लिक करून अंतिम सबमिट करणे
    console.log('📌 Step 10: Clicking final Submit button...');
    await assignmentPage.clickFinalSubmissionSubmit();
    await page.waitForTimeout(2000);

    // ११. id="assignment-view" बटणावर क्लिक करून View Submitted Assignments ओपन करणे
    console.log('📌 Step 11: Clicking button id="assignment-view" to open View Submitted Assignments...');
    await assignmentPage.clickViewSubmittedAssignments();
    await page.waitForTimeout(3000);

    console.log(`🎉 Whole assignment flow completed successfully in 1 single run with file: ${uploadedFile}!`);
  });
});
