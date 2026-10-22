/**
 * GroupPage - Group Module Page Object
 */
class GroupPage {
  /**
   * @param page
   */
  constructor(page) {
    this.page = page;

    // Group Module मधील लोकेटर्स
    this.createGroupButton = page.locator('button:has-text("Create Group"), button:has-text("New Group")');
    this.groupNameInput = page.locator('input[placeholder*="Group Name" i], input[name="groupName"]');
    this.groupDescriptionInput = page.locator('textarea[placeholder*="Description" i], textarea[name="description"]');
    this.saveGroupButton = page.locator('button:has-text("Save"), button:has-text("Submit"), button[type="submit"]');
  }

  /**
   * नवीन ग्रुप तयार करण्याचे मॉडेल उघडणे
   */
  async clickCreateGroup() {
    await this.createGroupButton.click();
  }

  /**
   * ग्रुपचे नाव आणि माहिती भरणे
   * @param {string} name
   * @param {string} [description]
   */
  async fillGroupDetails(name, description = '') {
    await this.groupNameInput.fill(name);
    if (description && await this.groupDescriptionInput.isVisible().catch(() => false)) {
      await this.groupDescriptionInput.fill(description);
    }
  }

  /**
   * ग्रुप सेव्ह करणे
   */
  async saveGroup() {
    await this.saveGroupButton.click();
  }
}

module.exports = GroupPage;
