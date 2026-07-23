const BasePage = require('./BasePage');

class HomePage extends BasePage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        super(page);

        // Header Navigation (Tailored strictly to mytravaly.in structure)
        this.logo = page.locator('header img, nav img, a[href="/"] img, img[alt*="logo" i]').first();
        this.addHotelButton = page.locator('a:has-text("Add Hotel"), button:has-text("Add Hotel"), a[href*="hotel" i]').first();
        this.getAppButton = page.locator('a:has-text("Get the app"), button:has-text("Get the app"), a[href*="app" i]').first();

        // Search Section
        this.locationBox = page.locator('input[placeholder*="Where" i], input[placeholder*="Location" i], input[placeholder*="Search" i], [aria-label*="location" i]').first();
        
        // Date Box: Fixed invalid multi-selector syntax by using a single clean text/regex locator
        this.dateBox = page.locator('text=/\\d{1,2}\\s+[A-Za-z]{3}\\s*-\\s*\\d{1,2}\\s+[A-Za-z]{3}/').first();
        
        // Guest Box: Restrict to interactive elements (button, input, or direct clickable controls)
        // In HomePage.js constructor:
// In HomePage.js constructor:
this.guestBox = page.locator('text=/\\d+\\s+Guests?/i').first();
        
        // Search Button: Explicit submit control
        this.searchButton = page.locator('button:has-text("Search"), button[type="submit"]').first();

        // Popular Properties Section: Restrict strictly to heading elements or isolated card headers
        this.popularProperties = page.locator('h1, h2, h3, h4').filter({ hasText: /Popular Properties|Popular/i }).first();
        
        // Category Tabs
        this.hotelsTab = page.locator('button:has-text("Hotels"), [role="tab"]:has-text("Hotels")').first();
        this.resortsTab = page.locator('button:has-text("Resorts"), [role="tab"]:has-text("Resorts")').first();
        this.homeStaysTab = page.locator('button:has-text("Home Stays"), [role="tab"]:has-text("Home Stays")').first();
        this.campsTab = page.locator('button:has-text("Camps & Tents"), button:has-text("Camps"), [role="tab"]:has-text("Camps")').first();
    }

    async openHomePage() {
        await this.navigate('/');
    }

    async verifyLogo() {
        await this.logo.waitFor({ state: 'visible', timeout: 10000 });
        return await this.logo.isVisible();
    }

    /**
     * Helper method to scroll to an element and click reliably while ensuring mytravaly.in context
     */
    async _safeClick(locator, timeout = 10000) {
        await locator.scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => {});
        await locator.waitFor({ state: 'visible', timeout });
        
        // Ensure anchor links do not unexpectedly cross over to mytravaly.com domain
        const href = await locator.getAttribute('href').catch(() => null);
        if (href && href.includes('mytravaly.com') && !href.includes('mytravaly.in')) {
            const correctedUrl = href.replace('mytravaly.com', 'mytravaly.in');
            await this.page.goto(correctedUrl);
            return;
        }

        await locator.click();
    }

    async clickAddHotel() {
        await this._safeClick(this.addHotelButton);
    }

    async clickGetApp() {
        await this._safeClick(this.getAppButton);
    }

    async clickLocation() {
        await this._safeClick(this.locationBox);
    }

    async clickDate() {
        await this._safeClick(this.dateBox);
    }

    async clickGuests() {
        await this._safeClick(this.guestBox);
    }

    async clickSearch() {
        await this._safeClick(this.searchButton);
    }

    async clickHotelsTab() {
        await this._safeClick(this.hotelsTab);
    }

    async clickResortsTab() {
        await this._safeClick(this.resortsTab);
    }

    async clickHomeStaysTab() {
        await this._safeClick(this.homeStaysTab);
    }

    async clickCampsTab() {
        await this._safeClick(this.campsTab);
    }
}

module.exports = HomePage;