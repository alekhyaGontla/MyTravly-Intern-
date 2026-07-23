const BasePage = require("./BasePage");
const { expect } = require("@playwright/test");

class FAQPage extends BasePage {

    constructor(page) {
        super(page);

        this.faqTitle = page.getByText("FAQ");
    }

    async verifyFAQVisible() {
        await expect(this.faqTitle).toBeVisible();
    }
}

module.exports = FAQPage;