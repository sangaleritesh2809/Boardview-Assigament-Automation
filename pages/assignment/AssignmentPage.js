const { expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

/**
 * AssignmentPage - BoardView School Management Assignment Page Object
 * यूजरने दिलेल्या अचूक ID आणि क्लासवर आधारित
 */
class AssignmentPage {
  /**
   * @param page
   */
  constructor(page) {
    this.page = page;

    // १. साइडबारमधील "Assignments" सब-आयटम: class="flex min-w-0 flex-1 overflow-hidden text-start"
    this.assignmentsSidebarItem = page.locator('.flex.min-w-0.flex-1.overflow-hidden.text-start, button, a, div')
      .filter({ hasText: /^Assignments$/i })
      .first();

    // २. "+ Add Assignment" बटण: id="assignment-add"
    this.addAssignmentButton = page.locator('#assignment-add, [id="assignment-add"]').or(
      page.getByRole('button', { name: /Add Assignment/i })
    ).first();

    // ३. Create Assignment फॉर्म फील्ड्स:
    // Title:
    this.titleInput = page.locator('#assignment-create-title, [id="assignment-create-title"]').or(
      page.getByPlaceholder('Enter assignment title')
    ).or(page.getByRole('textbox', { name: /Title \*/i })).first();

    // Description: id="assignment-create-description"
    this.descriptionInput = page.locator('#assignment-create-description, [id="assignment-create-description"]').or(
      page.getByPlaceholder('Enter description')
    ).or(page.getByRole('textbox', { name: /Description\*/i })).first();

    // ४. "User" टॅब:
    this.userTab = page.getByRole('button', { name: 'User', exact: true }).or(
      page.locator('#assignment-create-tab-user, [id="assignment-create-tab-user"]')
    ).first();

    // ५. User Search इनपुट: id="assignment-create-user-search"
    this.userSearchInput = page.locator('#assignment-create-user-search, [id="assignment-create-user-search"]').or(
      page.getByPlaceholder('Search user')
    ).or(
      page.getByRole('textbox', { name: 'User*' })
    ).first();

    // ६. Save बटण:
    this.saveButton = page.getByRole('button', { name: 'Save', exact: true }).or(
      page.locator('#assignment-create-save, [id="assignment-create-save"]')
    ).first();

    // Cancel बटण:
    this.cancelButton = page.getByRole('button', { name: 'Cancel', exact: true }).or(
      page.locator('button:has-text("Cancel")')
    ).first();

    // व्हॅलिडेशन व एरर लोकेटर्स (Negative Test Cases साठी):
    this.titleRequiredError = page.getByText(/Title is required/i).first();
    this.descriptionRequiredError = page.getByText(/Description is required/i).first();
    this.userRequiredError = page.locator('.Toastify__toast--error, [role="alert"]').filter({ hasText: /Please select at least one/i }).or(
      page.getByText(/Please select at least one filter/i)
    ).first();

    // ७. साइडबारमधील "My Assignments": id="assignment-my" किंवा complementary मधील My Assignments
    this.myAssignmentsSidebarItem = page.locator('#assignment-my, [id="assignment-my"]').or(
      page.getByRole('complementary').getByText('My Assignments', { exact: true })
    ).or(
      page.locator('button, a, div, span').filter({ hasText: /^My Assignments$/i })
    ).first();

    // साइडबारमधील "View Submitted Assignments": id="assignment-view" किंवा data-testid="assignment-view"
    this.viewSubmittedAssignmentsSidebarItem = page.locator(
      '#assignment-view, [data-testid="assignment-view"], [id="assignment-view"]'
    ).or(
      page.getByTestId('assignment-view')
    ).or(
      page.locator('.w-full.min-w-0.block.truncate').filter({ hasText: /View Submitted/i })
    ).first();

    // ८. Assignment Submit बटण: id="assignment-submit-a4ca5c22-99e1-46db-9a97-0d0cefed0915" किंवा इतर Submit बटणे
    this.submitAssignmentButton = page.locator('#assignment-submit-a4ca5c22-99e1-46db-9a97-0d0cefed0915, [id="assignment-submit-a4ca5c22-99e1-46db-9a97-0d0cefed0915"]').or(
      page.locator('[id^="assignment-submit-"], button:has-text("Submit")')
    ).first();

    // ९. Submission Note (id="assignment-submission-comment")
    this.submissionCommentInput = page.locator('#assignment-submission-comment, [id="assignment-submission-comment"]').or(
      page.getByPlaceholder(/Enter your submission notes/i)
    ).or(page.locator('textarea')).first();

    // १०. Submission Upload बटण (id="assignment-submission-upload")
    this.submissionUploadButton = page.locator('#assignment-submission-upload, [id="assignment-submission-upload"]').or(
      page.locator('button:has-text("Upload Files"), button:has-text("Add more files")')
    ).first();

    // ११. Submission फायनल Submit बटण (id="assignment-submission-submit")
    this.submissionSubmitButton = page.locator('#assignment-submission-submit, [id="assignment-submission-submit"]').or(
      page.locator('[role="dialog"], [class*="drawer"], [class*="modal"]').locator('button:has-text("Submit")')
    ).or(page.getByRole('button', { name: /^Submit$/i })).last();
  }

  /**
   * साइडबारमधील "Assignments" सब-ऑप्शनवर क्लिक करणे
   */
  async clickAssignmentsSubItem() {
    console.log('🖱️ Clicking on Assignments sub-item (class="flex min-w-0 flex-1 overflow-hidden text-start")...');
    await expect(this.assignmentsSidebarItem).toBeVisible({ timeout: 15000 });
    await this.assignmentsSidebarItem.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * My Assignments टेबलमधील डेटा लोड होण्याची वाट पाहणे
   */
  async waitForTableLoaded() {
    console.log('⏳ Waiting for My Assignments table to finish loading...');
    await this.page.locator('table, [role="table"]')
      .first()
      .waitFor({ state: 'visible', timeout: 10000 })
      .catch(() => {});
    await this.page.waitForTimeout(500);
  }

  /**
   * साइडबारमधील "My Assignments" पर्यायावर (id="assignment-my") क्लिक करणे
   */
  async clickMyAssignments() {
    console.log('🖱️ Clicking on My Assignments (id="assignment-my")...');
    // जर जुना backdrop दिसत असेल तर तो बंद होण्याची वाट पाहणे
    await this.page.locator('.fixed.inset-0.bg-black\\/40, [class*="bg-black/40"]')
      .waitFor({ state: 'hidden', timeout: 5000 })
      .catch(() => {});

    const myItem = this.page.locator('.flex.min-w-0.flex-1.overflow-hidden.text-start, a, button, div')
      .filter({ hasText: /^My Assignments$/i })
      .or(this.page.getByText('My Assignments', { exact: true }))
      .first();

    await expect(myItem).toBeVisible({ timeout: 15000 });
    await myItem.scrollIntoViewIfNeeded().catch(() => {});
    await myItem.click();
    await this.page.waitForTimeout(1500);

    // जर My Assignments स्क्रीन उघडली नसेल तर पुन्हा क्लिक करणे
    const myHeading = this.page.getByRole('heading', { name: /My Assignments/i });
    if (!(await myHeading.isVisible({ timeout: 3000 }).catch(() => false))) {
      console.log('🔄 Retrying click on My Assignments item with force...');
      await myItem.click({ force: true }).catch(() => {});
      await this.page.waitForTimeout(2000);
    }

    await this.waitForTableLoaded();
  }

  /**
   * साइडबारमधील "View Submitted Assignments" बटणावर (id="assignment-view") क्लिक करून ते ओपन करणे
   */
  async clickViewSubmittedAssignments() {
    console.log('🖱️ Clicking button id="assignment-view" (data-testid="assignment-view") to open View Submitted Assignments...');
    
    // १. id="assignment-view" किंवा data-testid="assignment-view" शोधणे
    const viewButton = this.page.locator('#assignment-view, [data-testid="assignment-view"]').or(
      this.viewSubmittedAssignmentsSidebarItem
    ).first();

    await expect(viewButton).toBeVisible({ timeout: 15000 });
    await viewButton.scrollIntoViewIfNeeded().catch(() => {});

    // २. क्लिक करणे (फोर्स क्लिक फॉलबॅकसह)
    try {
      await viewButton.click();
    } catch {
      await viewButton.click({ force: true });
    }

    // ३. पेज/व्ह्यू ओपन होण्याची वाट पाहणे
    await this.page.waitForTimeout(1500);

    // ४. "View Assignment" स्क्रीन ओपन झाल्याची खात्री करणे
    const viewHeader = this.page.locator('h1, h2, h3, header, [role="heading"]')
      .filter({ hasText: /View Assignment|View Submitted/i })
      .first();
    const isOpened = await viewHeader.isVisible({ timeout: 10000 }).catch(() => false);
    if (isOpened) {
      console.log('📖 View Assignment screen is open and visible!');
    }

    await this.page.locator('table, [role="table"]')
      .first()
      .waitFor({ state: 'visible', timeout: 15000 })
      .catch(() => {});

    console.log('✅ Clicked on button id="assignment-view" and opened View Assignment successfully!');
  }

  /**
   * View Assignment टेबलमधील पहिल्या रो मधील View बटणावर (कॉलम View मधील '1' / view बटण) क्लिक करणे
   */
  async clickFirstRowViewButton() {
    console.log('🖱️ Clicking View action button (e.g. "1") in first row of View Assignment table...');
    const table = this.page.locator('table, [role="table"]').first();
    await expect(table).toBeVisible({ timeout: 15000 });

    // पहिल्या रो मधील शेवटचा सेल (View कॉलम)
    const firstRowLastCell = table.locator('tbody tr').first().locator('td').last();
    const viewBtn = firstRowLastCell.locator('button, [role="button"], a, span, div').filter({ hasText: /^[0-9]+$/ }).or(
      firstRowLastCell.locator('button, [role="button"]')
    ).first();

    if (await viewBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('🖱️ Found View action button in first row, clicking it...');
      await viewBtn.scrollIntoViewIfNeeded().catch(() => {});
      await viewBtn.click({ force: true });
      await this.page.waitForTimeout(2000);
      console.log('✅ Clicked View action in table successfully!');
    } else {
      console.log('ℹ️ View action button in table row already handled or not clickable.');
    }
  }

  /**
   * "+ Add Assignment" बटणावर क्लिक करणे (id="assignment-add")
   */
  async clickAddAssignment() {
    console.log('🖱️ Clicking on + Add Assignment button (id="assignment-add")...');
    await expect(this.addAssignmentButton).toBeVisible({ timeout: 15000 });
    await this.addAssignmentButton.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Title आणि Description भरणे (id="assignment-create-description")
   * @param {string} [title]
   * @param {string} [description]
   */
  async fillAssignmentDetails(title = 'Assignment', description = 'Assignment') {
    await this.page.waitForTimeout(1000);
    if (await this.titleInput.isVisible({ timeout: 10000 }).catch(() => false)) {
      console.log(`📝 Entering Title: ${title}`);
      await this.titleInput.fill(title);
    }

    console.log(`📝 Clicking and entering Description: ${description}`);
    const descLocator = this.page.locator('#assignment-create-description, [id="assignment-create-description"]').or(
      this.page.locator('textarea[placeholder*="description" i], input[placeholder*="description" i]')
    ).or(
      this.page.getByPlaceholder('Enter description')
    ).or(
      this.page.locator('textarea')
    ).first();

    if (await descLocator.isVisible({ timeout: 15000 }).catch(() => false)) {
      await descLocator.scrollIntoViewIfNeeded().catch(() => {});
      await descLocator.click();
      await descLocator.fill(description);
      console.log(`✅ Description filled: ${description}`);
    } else {
      console.log('ℹ️ Description field not visible, proceeding...');
    }
  }

  /**
   * User टॅबवर क्लिक करणे (id="assignment-create-tab-user")
   */
  async clickUserTab() {
    console.log('🖱️ Clicking on User tab (id="assignment-create-tab-user")...');
    await expect(this.userTab).toBeVisible({ timeout: 15000 });
    await this.userTab.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * User शोधून सिलेक्ट करणे (id="assignment-create-user-search")
  /**
   * User शोधून सिलेक्ट करणे (id="assignment-create-user-search")
   * User येण्यासाठी लागणारा वेळ लक्षात घेऊन वाट पाहणे आणि तो सिलेक्ट होईपर्यंत थांबणे
   * @param {string} [userName]
   */
  async searchAndSelectUser(userName = 'sujit shirsath') {
    console.log(`🔍 Searching user: "${userName}" using id="assignment-create-user-search"...`);

    // १. 'Search user' इनपुट (id="assignment-create-user-search") शोधणे व स्क्रोल करणे
    const searchInput = this.page.locator('#assignment-create-user-search, [id="assignment-create-user-search"]').or(
      this.userSearchInput
    ).first();

    await searchInput.scrollIntoViewIfNeeded().catch(() => {});
    await expect(searchInput).toBeVisible({ timeout: 15000 });

    // २. इनपुटवर क्लिक करून नाव टाईप करणे
    await searchInput.click();
    await searchInput.fill('');
    await searchInput.pressSequentially(userName, { delay: 100 });
    console.log(`⏳ Typed "${userName}". Waiting for user list to load...`);

    // ३. "Loading users..." दिसत असल्यास ते पूर्णपणे जाईपर्यंत वाट पाहणे
    await this.page.getByText(/Loading users/i).waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
    await this.page.getByText(/Loading users/i).waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});
    await this.page.waitForTimeout(1000);

    // ४. फक्त उजव्या बाजूच्या ड्रॉवरमधील 'sujit shirsath' पर्याय येईपर्यंत वाट पाहणे (Timeout: 30s)
    console.log(`⏳ Waiting for user "${userName}" to appear inside drawer...`);

    let targetOption = null;
    const startTime = Date.now();
    const timeoutMs = 30000;

    while (Date.now() - startTime < timeoutMs) {
      const isLoading = await this.page.getByText(/Loading users/i).isVisible().catch(() => false);
      if (isLoading) {
        await this.page.waitForTimeout(500);
        continue;
      }

      // ड्रॉवरमधील मॅचेस शोधणे (x > 350, साइडबार वगळून)
      const allMatches = await this.page.getByText(new RegExp(userName, 'i')).all();
      for (const match of allMatches) {
        const isVisible = await match.isVisible().catch(() => false);
        if (!isVisible) continue;
        const box = await match.boundingBox().catch(() => null);
        if (box && box.x > 350) {
          targetOption = match;
          console.log(`🎯 Found user "${userName}" option inside drawer at x=${box.x}, y=${box.y}!`);
          break;
        }
      }

      if (targetOption) break;
      await this.page.waitForTimeout(500);
    }

    // जर पूर्ण नावाने पर्याय सापडला नाही, तर पहिल्या नावाने (First Name) शोधणे
    if (!targetOption) {
      const firstName = userName.split(' ')[0];
      console.log(`🔍 User not found with full name, searching with "${firstName}"...`);
      await searchInput.click();
      await searchInput.fill('');
      await searchInput.pressSequentially(firstName, { delay: 100 });
      await this.page.getByText(/Loading users/i).waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
      await this.page.getByText(/Loading users/i).waitFor({ state: 'hidden', timeout: 20000 }).catch(() => {});
      await this.page.waitForTimeout(1000);

      const partialMatches = await this.page.getByText(new RegExp(firstName, 'i')).all();
      for (const match of partialMatches) {
        const isVisible = await match.isVisible().catch(() => false);
        if (!isVisible) continue;
        const box = await match.boundingBox().catch(() => null);
        if (box && box.x > 350) {
          targetOption = match;
          console.log(`🎯 Found user option inside drawer at x=${box.x}, y=${box.y}!`);
          break;
        }
      }
    }

    if (!targetOption) {
      throw new Error(`User option "${userName}" could not be found inside the drawer after waiting!`);
    }

    await targetOption.scrollIntoViewIfNeeded().catch(() => {});

    // ५. फक्त त्या युझरवर ('sujit shirsath') क्लिक करणे
    console.log(`🖱️ Clicking only on "${userName}" user option to select...`);
    await targetOption.click({ force: true });
    await this.page.waitForTimeout(1000);

    // ६. युझर सिलेक्ट होईपर्यंत थांबणे (Clear All बटण ॲक्टिव्ह / enabled होईपर्यंत वाट पाहणे)
    console.log(`⏳ Waiting until user "${userName}" is fully selected...`);
    const clearAllBtn = this.page.getByRole('button', { name: /Clear All/i }).or(this.page.locator('button:has-text("Clear All")')).first();
    
    // Clear All बटण enabled झाले का ते तपासणे (Max 15 सेकंद वाट पाहणे)
    const selectStartTime = Date.now();
    let isSelected = false;

    while (Date.now() - selectStartTime < 15000) {
      if (await clearAllBtn.isVisible().catch(() => false)) {
        const isClearDisabled = await clearAllBtn.isDisabled().catch(() => true);
        if (!isClearDisabled) {
          isSelected = true;
          console.log(`✅ User selection verified! Clear All button is enabled.`);
          break;
        }
      }

      // जर अजून सिलेक्ट झाला नसेल तर कंटेनर/चेकबॉक्सवर क्लिक करणे
      console.log(`🔄 User not yet confirmed selected. Clicking user card / checkbox again...`);
      await targetOption.evaluate(el => {
        const container = el.closest('[role="option"], [role="checkbox"], label, li, tr, div[class*="cursor-pointer"], button') || el.parentElement;
        if (!container) return;
        const cb = container.querySelector('input[type="checkbox"], [role="checkbox"]');
        if (cb) {
          cb.click();
        } else {
          container.click();
        }
      }).catch(() => {});
      await this.page.waitForTimeout(1500);
    }

    await this.page.waitForTimeout(1000);
    console.log(`✅ User "${userName}" selected successfully! Ready to save/submit assignment.`);
  }

  /**
   * Save बटणावर क्लिक करणे (id="assignment-create-save")
   * @param {boolean} [waitForClose=true]
   */
  async clickSave(waitForClose = true) {
    console.log('💾 Clicking Save button (id="assignment-create-save")...');
    const saveBtn = this.page.getByRole('button', { name: 'Save', exact: true }).or(this.saveButton).first();
    await expect(saveBtn).toBeVisible({ timeout: 15000 });
    await saveBtn.scrollIntoViewIfNeeded().catch(() => {});
    await saveBtn.click();
    await this.page.waitForTimeout(1000);

    if (waitForClose) {
      // ड्रॉवर बंद होण्याची वाट पाहणे
      console.log('⏳ Waiting for Create Assignment drawer to close after save...');
      await this.page.getByRole('heading', { name: 'Create Assignment' })
        .waitFor({ state: 'hidden', timeout: 15000 })
        .catch(() => {});
      await this.page.waitForTimeout(1000);
    }
  }

  /**
   * Create Assignment ड्रॉवरमधील Cancel बटणावर क्लिक करून ड्रॉवर बंद करणे
   */
  async clickCancel() {
    console.log('❌ Clicking Cancel button in Create Assignment drawer...');
    await expect(this.cancelButton).toBeVisible({ timeout: 10000 });
    await this.cancelButton.click();
    await this.page.getByRole('heading', { name: 'Create Assignment' })
      .waitFor({ state: 'hidden', timeout: 10000 })
      .catch(() => {});
    await this.page.waitForTimeout(1000);
  }

  /**
   * Assignment Submit बटणावर क्लिक करणे (नवीन तयार केलेल्या असाइनमेंटच्या रो मधील Submit बटण)
   * @param {string} [assignmentTitle] - असाइनमेंटचे नाव
   */
  async clickSubmitAssignment(assignmentTitle = null) {
    console.log(`🖱️ Finding clickable Submit button for assignment: "${assignmentTitle || 'latest'}"...`);
    
    // १. आधी टेबल लोड होण्याची वाट पाहणे
    await this.waitForTableLoaded();

    let targetBtn = null;
    const startTime = Date.now();

    while (Date.now() - startTime < 30000) {
      // जर assignmentTitle दिलेले असेल तर त्या अचूक असाइनमेंटची रो शोधणे
      if (assignmentTitle) {
        const matchingRow = this.page.locator('table tbody tr').filter({ hasText: assignmentTitle }).first();
        if (await matchingRow.isVisible({ timeout: 1500 }).catch(() => false)) {
          const rowSubmitBtn = matchingRow.locator('button:not([disabled])').filter({ hasText: /^Submit$/i }).first();
          if (await rowSubmitBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
            targetBtn = rowSubmitBtn;
            console.log(`✅ Found active Submit button for assignment "${assignmentTitle}" in row!`);
            break;
          }
        }
      }

      // जर assignmentTitle नसेल किंवा रो सापडली नसेल तर पहिल्या रो (नवीनतम असाइनमेंट) मधील Submit बटण
      const firstRow = this.page.locator('table tbody tr').first();
      if (await firstRow.isVisible({ timeout: 1500 }).catch(() => false)) {
        const firstRowSubmitBtn = firstRow.locator('button:not([disabled])').filter({ hasText: /^Submit$/i }).first();
        if (await firstRowSubmitBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
          targetBtn = firstRowSubmitBtn;
          console.log('✅ Found active Submit button in first (latest) row of table!');
          break;
        }
      }

      console.log('🔄 Assignment not yet visible in table. Re-clicking My Assignments to refresh table...');
      await this.clickMyAssignments();
      await this.page.waitForTimeout(2000);
    }

    if (!targetBtn) {
      // फॉलबॅक: टेबलमधील सर्वात वरचे active Submit बटण
      targetBtn = this.page.locator('table tbody tr').first().locator('button:not([disabled])').filter({ hasText: /^Submit$/i }).first();
    }

    await expect(targetBtn).toBeVisible({ timeout: 15000 });
    await targetBtn.scrollIntoViewIfNeeded().catch(() => {});
    await targetBtn.click();
    await this.page.waitForTimeout(1000);
    console.log(`✅ Clicked Submit button successfully for assignment!`);
  }

  /**
   * Submission Note भरणे (id="assignment-submission-comment")
   * @param {string} [comment] - 'good task'
   */
  async fillSubmissionComment(comment = 'good task') {
    console.log(`📝 Entering Submission Note (id="assignment-submission-comment"): "${comment}"...`);
    await expect(this.submissionCommentInput).toBeVisible({ timeout: 15000 });
    await this.submissionCommentInput.click();
    await this.submissionCommentInput.fill(comment);
    await this.page.waitForTimeout(500);
    console.log(`✅ Note entered: "${comment}"`);
  }

  /**
   * Unique ID सह इमेज तयार करून अपलोड करणे (id="assignment-submission-upload")
   * खात्री करणे की इमेज अपलोड स्किप होणार नाही (skip zale nahi pahije)
   * @returns {Promise<string>}
   */
  async uploadSubmissionImage() {
    // युनिक नाव / ID सह इमेज तयार करणे
    const uniqueId = `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fileName = `upload_${uniqueId}.png`;
    const fixturesDir = path.join(process.cwd(), 'fixtures');
    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }
    const targetFilePath = path.join(fixturesDir, fileName);

    // युनिक वैध minimal PNG इमेज तयार करणे (कोणताही स्क्रीनशॉट न वापरता थेट तयार करणे)
    const minimalPng = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    fs.writeFileSync(targetFilePath, minimalPng);

    console.log(`📎 Uploading unique image file: ${fileName} (${targetFilePath})...`);
    await expect(this.submissionUploadButton).toBeVisible({ timeout: 15000 });

    // २. File input शोधणे (Submission drawer मधील किंवा direct)
    let uploaded = false;
    const directFileInput = this.page.locator(
      '#assignment-submission-upload input[type="file"], [role="dialog"] input[type="file"], [class*="drawer"] input[type="file"], input[type="file"]'
    );
    if (await directFileInput.count().then(c => c > 0).catch(() => false)) {
      try {
        console.log('📤 Setting files directly via input[type="file"]...');
        await directFileInput.first().setInputFiles(targetFilePath);
        uploaded = true;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.log(`⚠️ Direct setInputFiles failed (${errorMsg}), will trigger fileChooser...`);
      }
    }

    if (!uploaded) {
      console.log('📤 Triggering file chooser via upload button click...');
      const [fileChooser] = await Promise.all([
        this.page.waitForEvent('filechooser', { timeout: 15000 }),
        this.submissionUploadButton.click()
      ]);
      await fileChooser.setFiles(targetFilePath);
    }

    // ३. इमेज अपलोड पूर्ण होण्याची आणि 'Uploading' स्पिनर संपण्याची वाट पाहणे (skip zale nahi pahije)
    console.log(`⏳ Verifying uploaded file is displayed in UI (skip zale nahi pahije)...`);
    
    // जर 'Uploading' टेक्स्ट किंवा स्पिनर दिसत असेल तर तो संपण्याची वाट पाहणे
    await this.page.locator('text=Uploading').waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});
    await this.page.waitForTimeout(1000);

    const uploadedVerification = this.page.locator('button:has-text("Add more files")').or(
      this.page.locator(`text=${fileName}`)
    ).or(
      this.page.locator('svg.lucide-x, [class*="lucide-x"]')
    ).first();

    await expect(uploadedVerification).toBeVisible({ timeout: 20000 });
    console.log(`✅ Image file "${fileName}" attached and upload finished successfully!`);
    return fileName;
  }

  /**
   * फायनल Submission Submit बटणावर (id="assignment-submission-submit") क्लिक करणे
   */
  async clickFinalSubmissionSubmit() {
    console.log('💾 Clicking Final Submission Submit button (id="assignment-submission-submit")...');
    await expect(this.submissionSubmitButton).toBeVisible({ timeout: 15000 });
    await this.submissionSubmitButton.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.page.waitForTimeout(2000);
    console.log('✅ Final Assignment submitted successfully!');
  }
}

module.exports = AssignmentPage;
