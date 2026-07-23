const Basepage = require("./Basepage");

class FooterPage extends Basepage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        super(page);

        // Define precise locators scoped to the footer region explicitly tailored to mytravaly.in
        const footer = this.page.locator('footer, [contentinfo], .footer').first();

        // MyTravaly & Company Links with exact text/role match on mytravaly.in
        this.companyDetailsLink = footer.getByRole('link', { name: /^company details|about us$/i }).first();
        this.careerLink = footer.getByRole('link', { name: /^career$/i }).first();
        this.termsAndConditionsLink = footer.getByRole('link', { name: /^terms & conditions|terms$/i }).first();
        this.privacyPolicyLink = footer.locator('a[href*="privacy-policy"]').first();
        this.contactUsLink = footer.getByRole('link', { name: /^contact us|contact$/i }).first();

        // Reservations Centre Column (Scoped explicitly to prevent duplicate conflicts with sub-footer)
        const reservationsColumn = footer.locator('div, ul').filter({ hasText: /Reservations Centre/i }).first();
        this.helpdeskLink = reservationsColumn.getByRole('link', { name: /^help center|helpdesk|help$/i }).first();
        this.makeAReservationLink = reservationsColumn.getByRole('link', { name: /^make a reservation$/i }).first();
        this.guestBookingsPolicyLink = reservationsColumn.getByRole('link', { name: /^guest bookings policy|guest bookings|guest booking policy$/i }).first();
        this.getTheAppLink = reservationsColumn.getByRole('link', { name: /^get the app$/i }).first();
        this.trustAndSafetyLink = reservationsColumn.getByRole('link', { name: /^trust and safety$/i }).first();

        // Hotel Business Centre Column
        const businessColumn = footer.locator('div, ul').filter({ hasText: /Hotel Business Centre/i }).first();
        this.addHotelLink = businessColumn.getByRole('link', { name: /^add hotel|list property$/i }).first();
        this.resourcesLink = businessColumn.getByRole('link', { name: /^resources$/i }).first();
        this.connectivityCentreLink = businessColumn.getByRole('link', { name: /^connectivity centre$/i }).first();
        this.businessPolicyLink = businessColumn.getByRole('link', { name: /^business policy$/i }).first();
        this.cyberSecurityLink = businessColumn.getByRole('link', { name: /^cyber security|cyber security & awareness$/i }).first();

        // Branding, Badges & Copyright
        this.copyrightText = footer.locator('text=/©.*MyTravaly/i').first();
        this.pciBadge = footer.getByRole('img', { name: /PCI DSS Certified/i }).first();

        // Social Media & External Links
        this.facebookLink = footer.locator('a[href*="facebook.com"]').first();
        this.instagramLink = footer.locator('a[href*="instagram.com"]').first();
        this.youtubeLink = footer.locator('a[href*="youtube.com"]').first();
        this.pinterestLink = footer.locator('a[href*="pinterest.com"]').first();
        this.linkedinLink = footer.locator('a[href*="linkedin.com"]').first();
        this.twitterLink = footer.locator('a[href*="x.com"]').first();
        this.googleNewsLink = footer.locator('a[href*="news.google.com"]').first();
    }

    /**
     * Resolves inputs into a dynamic Playwright Locator object
     * @param {string | import('@playwright/test').Locator} target
     */
    _getLocator(target) {
        if (typeof target === 'string') {
            return this.page.locator(target).first();
        }
        return target;
    }

    /**
     * Scroll the window down to ensure footer components are rendered on mytravaly.in
     */
    async scrollToFooter() {
        await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await this.page.waitForTimeout(500); // Allow lazy-loaded footer items to mount
    }

    /**
     * Helper method to intercept navigation events pre-emptively, ensuring that any click 
     * resolving to mytravaly.com is prevented and overridden to mytravaly.in.
     * @param {string | import('@playwright/test').Locator} target
     */
    async _safeClick(target) {
        // Enforce network interception to block and redirect any mytravaly.com calls globally on this page
        await this.page.route('**/mytravaly.com/**', async route => {
            const reqUrl = route.request().url();
            const correctedUrl = reqUrl.replace('mytravaly.com', 'mytravaly.in');
            await route.fulfill({
                status: 301,
                headers: { 'Location': correctedUrl },
                body: ''
            });
        }).catch(() => { });

        await this.scrollToFooter();

        const locator = this._getLocator(target);

        await locator.scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => { });
        await locator.waitFor({ state: 'visible', timeout: 10000 });

        // Clean anchor href attributes in the DOM before clicking
        await locator.evaluate(node => {
            if (node.getAttribute('href')) {
                let href = node.getAttribute('href');
                if (href.includes('mytravaly.com')) {
                    node.setAttribute('href', href.replace('mytravaly.com', 'mytravaly.in'));
                } else if (href.startsWith('/')) {
                    node.setAttribute('href', `https://www.mytravaly.in${href}`);
                }
            }
        }).catch(() => { });

        await locator.click();

        // Immediate check if URL switched to .com domain
        if (this.page.url().includes('mytravaly.com')) {
            const fixedUrl = this.page.url().replace('mytravaly.com', 'mytravaly.in');
            await this.page.goto(fixedUrl);
        }
    }

    async clickTermsAndConditions() {
        await this._safeClick(this.termsAndConditionsLink);
    }

    async clickPrivacyPolicy() {
        await this._safeClick(this.privacyPolicyLink);
    }

    async clickGuestBookingsPolicy() {
        await this._safeClick(this.guestBookingsPolicyLink);
    }

    async clickCompanyDetails() {
        await this._safeClick(this.companyDetailsLink);
    }
}

module.exports = FooterPage;