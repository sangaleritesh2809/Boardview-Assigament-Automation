const { expect } = require('@playwright/test');

/**
 * MenuPage - BoardView साइडबार आणि नेव्हिगेशन मेनू पेज ऑब्जेक्ट
 */
class MenuPage {
  /**
   * @param page
   */
  constructor(page) {
    this.page = page;

    // मेनू लोकेटर्स (Dashboard Sidebar)
    this.menuSearchInput = page.locator('input[placeholder="Search across all menu items..."]');
    this.welcomeMenuItem = page.locator('text=Welcome').first();
    this.boardsMenuItem = page.locator('.sidebarSectionLabel').filter({ hasText: /boards/i }).first();
    // यूजरने दिलेल्या अचूक DOM क्लास (.sidebarSectionLabel) नुसार Applications लोकेटर:
    this.applicationsSection = page.locator('.sidebarSectionLabel').filter({ hasText: /applications/i }).first();
    this.applicationsMenuItem = this.applicationsSection;
    this.pagesMenuItem = page.locator('.sidebarSectionLabel').filter({ hasText: /pages/i }).first();
    this.workflowsMenuItem = page.locator('text=WORKFLOWS').first();

    // यूजरने दिलेल्या अचूक id="school-management" नुसार लोकेटर:
    this.schoolManagementItem = page.locator('#school-management, [id="school-management"]').or(
      page.locator('button, a, div, span').filter({ hasText: /^School Management$/i })
    ).first();

    // यूजरने दिलेल्या अचूक id="school-assignment" नुसार लोकेटर:
    this.assignmentMenuItem = page.locator('#school-assignment, [id="school-assignment"]').or(
      page.locator('button, a, div, span').filter({ hasText: /^Assignment$/i })
    ).first();
  }

  /**
   * मेनू सर्च बॉक्समध्ये सर्च करणे
   * @param {string} query
   */
  async searchMenu(query) {
    await expect(this.menuSearchInput).toBeVisible({ timeout: 10000 });
    await this.menuSearchInput.fill(query);
  }

  /**
   * Applications मॉड्यूल / सेक्शनवर क्लिक करणे (Expand / Open करणे)
   */
  async clickApplications() {
    await expect(this.applicationsSection).toBeVisible({ timeout: 15000 });
    await this.applicationsSection.click();
  }

  /**
   * School Management आयटमवर (id="school-management") क्लिक करणे
   */
  async clickSchoolManagement() {
    // १. जर School Management दिसत नसेल तर आधी Applications सेक्शन उघडणे
    if (!(await this.schoolManagementItem.isVisible().catch(() => false))) {
      console.log('📂 Applications section appears closed. Clicking Applications to expand...');
      await this.clickApplications();
      await this.page.waitForTimeout(1000);
    }

    console.log('🖱️ Clicking on School Management (id="school-management")...');
    await expect(this.schoolManagementItem).toBeVisible({ timeout: 15000 });
    await this.schoolManagementItem.click();
  }

  /**
   * Assignment आयटमवर (id="school-assignment") क्लिक करणे
   */
  async clickAssignment() {
    // जर School Management आधीपासून उघडलेले नसेल आणि Assignment दिसत नसेल तर आधी School Management उघडणे
    if (!(await this.assignmentMenuItem.isVisible().catch(() => false))) {
      console.log('📂 Assignment item not visible yet. Opening School Management first...');
      await this.clickSchoolManagement();
      await this.page.waitForTimeout(1000);
    }

    console.log('🖱️ Clicking on Assignment (id="school-assignment")...');
    await expect(this.assignmentMenuItem).toBeVisible({ timeout: 15000 });
    await this.assignmentMenuItem.click();
  }

  /**
   * कोणत्याही मेनू आयटमवर क्लिक करणे
   * @param {string} menuName
   */
  async clickMenuItem(menuName) {
    const item = this.page.locator(`text="${menuName}"`).first();
    await expect(item).toBeVisible({ timeout: 10000 });
    await item.click();
  }
}

module.exports = MenuPage;
