const fs = require('fs');
const path = require('path');

class BasePage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;
    }

    /**
     * Internal helper to normalize inputs so methods accept 
     * either a string selector OR an existing Playwright Locator object.
     */
    _getLocator(locatorOrSelector) {
        if (typeof locatorOrSelector === 'string') {
            return this.page.locator(locatorOrSelector);
        }
        return locatorOrSelector;
    }

    /**
     * Resolves a target selector dynamically whether it sits in the top-level document
     * or inside an iframe (e.g., Razorpay, PayU, Stripe checkout frames).
     * This avoids invalid `.or()` chains between page Locators and FrameLocators.
     */
    async getDynamicElement(selector, frameSelector = 'iframe[title*="checkout"], iframe[src*="payu"], iframe[src*="razorpay"]') {
        const mainLocator = this.page.locator(selector).first();
        
        try {
            if (await mainLocator.isVisible({ timeout: 2000 })) {
                return mainLocator;
            }
        } catch (_) {
            // Fall through to check inside iframe if element isn't visible on main page
        }

        const iframe = this.page.frameLocator(frameSelector).first();
        return iframe.locator(selector).first();
    }

    // Navigate to URL
    async navigate(url = '/') {
        await this.page.goto(url, {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });
    }

    // Click element (with auto-scroll safeguard)
    async click(locatorOrSelector) {
        let loc;
        if (typeof locatorOrSelector === 'string') {
            loc = await this.getDynamicElement(locatorOrSelector);
        } else {
            loc = this._getLocator(locatorOrSelector);
        }

        await loc.scrollIntoViewIfNeeded().catch(() => {});
        await loc.click({ timeout: 15000 });
    }

    // Enter text
    async fill(locatorOrSelector, value) {
        let loc;
        if (typeof locatorOrSelector === 'string') {
            loc = await this.getDynamicElement(locatorOrSelector);
        } else {
            loc = this._getLocator(locatorOrSelector);
        }

        await loc.scrollIntoViewIfNeeded().catch(() => {});
        await loc.fill(value, { timeout: 15000 });
    }

    // Get text content
    async getText(locatorOrSelector) {
        let loc;
        if (typeof locatorOrSelector === 'string') {
            loc = await this.getDynamicElement(locatorOrSelector);
        } else {
            loc = this._getLocator(locatorOrSelector);
        }
        return (await loc.textContent())?.trim() || '';
    }

    // Wait for element visibility
    async waitForElement(locatorOrSelector, timeout = 10000) {
        let loc;
        if (typeof locatorOrSelector === 'string') {
            loc = await this.getDynamicElement(locatorOrSelector);
        } else {
            loc = this._getLocator(locatorOrSelector);
        }

        await loc.waitFor({
            state: 'visible',
            timeout: timeout
        });
    }

    // Check if element is visible safely (returns boolean)
    async isVisible(locatorOrSelector) {
        try {
            let loc;
            if (typeof locatorOrSelector === 'string') {
                loc = await this.getDynamicElement(locatorOrSelector);
            } else {
                loc = this._getLocator(locatorOrSelector);
            }
            return await loc.isVisible();
        } catch {
            return false;
        }
    }

    // Select dropdown option by value/label
    async selectOption(locator, value) {
        await this._getLocator(locator).selectOption(value);
    }

    // Press keyboard key on a locator
    async press(locator, key) {
        await this._getLocator(locator).press(key);
    }

    // Hover on element
    async hover(locator) {
        const loc = this._getLocator(locator);
        await loc.scrollIntoViewIfNeeded().catch(() => {});
        await loc.hover();
    }

    // Scroll into view
    async scrollTo(locator) {
        await this._getLocator(locator).scrollIntoViewIfNeeded();
    }

    // Take full-page screenshot (creates screenshots directory if missing)
    async takeScreenshot(fileName) {
        const dir = path.join(process.cwd(), 'screenshots');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        await this.page.screenshot({
            path: path.join(dir, `${fileName}.png`),
            fullPage: true
        });
    }

    // Get current page title
    async getTitle() {
        return await this.page.title();
    }

    // Get current URL
    async getURL() {
        return this.page.url();
    }

    // Reload page
    async reload() {
        await this.page.reload({ waitUntil: 'domcontentloaded' });
    }

    // Wait for network to be idle (Useful for heavy SPA/React transitions)
    async waitForNetworkIdle() {
        await this.page.waitForLoadState('networkidle').catch(() => {});
    }
}

module.exports = BasePage;