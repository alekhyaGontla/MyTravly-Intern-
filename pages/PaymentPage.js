const BasePage = require('./BasePage');

class PaymentPage extends BasePage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        super(page);

        // Merchant and Amount Selectors (mytravaly.in specific)
        this.merchantNameLoc = 'text=/mytravaly/i, img[alt*="mytravaly" i]';
        this.totalPayableLoc = 'text=/₹\\s*[0-9,]+(\\.[0-9]+)?/i, text=/total payable/i';

        // Card Input Selectors (Flexible across PayU, Razorpay, and direct forms)
        this.cardNumberInput = 'input[placeholder*="card number" i], input[name*="cardno" i], input[name*="card" i], input[id*="card" i]';
        this.expiryInput = 'input[placeholder*="mm" i], input[placeholder*="expiry" i], input[name*="exp" i]';
        this.cvvInput = 'input[placeholder*="cvv" i], input[placeholder*="cvc" i], input[name*="cvv" i]';
        this.nameOnCardInput = 'input[placeholder*="name" i], input[placeholder*="cardholder" i], input[name*="cname" i]';
        
        // Action Selectors
        this.proceedBtn = 'button:has-text("PROCEED"), button:has-text("Pay"), button:has-text("Make Payment"), button[type="submit"]';
        this.languageDropdown = 'text=Change language, button:has-text("Language"), [aria-label*="language" i]';

        // Direct page locators initialized safely without premature evaluation
        this.merchantName = page.locator(this.merchantNameLoc).first();
        this.totalPayable = page.locator(this.totalPayableLoc).first();
        this.submitButton = page.locator(this.proceedBtn).first();
    }

    /**
     * Resolves elements across main DOM and dynamically created gateway iframes
     */
    async _resolveLocator(selector) {
        // Direct DOM check first
        const mainLoc = this.page.locator(selector).first();
        if (await mainLoc.isVisible({ timeout: 2000 }).catch(() => false)) {
            return mainLoc;
        }

        // Search inside attached frames (PayU / Razorpay / Cashfree)
        for (const frame of this.page.frames()) {
            try {
                const frameLoc = frame.locator(selector).first();
                if (await frameLoc.isVisible({ timeout: 1500 }).catch(() => false)) {
                    return frameLoc;
                }
            } catch (_) {
                // Ignore detached frame errors during route transitions
            }
        }

        return mainLoc;
    }

    async fillCardDetails(cardNumber, expiry, cvv, name) {
        const cardLoc = await this._resolveLocator(this.cardNumberInput);
        const expLoc = await this._resolveLocator(this.expiryInput);
        const cvvLoc = await this._resolveLocator(this.cvvInput);
        const nameLoc = await this._resolveLocator(this.nameOnCardInput);

        await cardLoc.waitFor({ state: 'visible', timeout: 15000 });

        await cardLoc.fill(cardNumber);
        await expLoc.fill(expiry);
        await cvvLoc.fill(cvv);
        if (await nameLoc.isVisible().catch(() => false)) {
            await nameLoc.fill(name);
        }
    }

    async clickProceed() {
        const btnLoc = await this._resolveLocator(this.proceedBtn);
        await btnLoc.waitFor({ state: 'visible', timeout: 10000 });
        await btnLoc.click();
    }

    async selectGatewayLanguage(language) {
        const dropLoc = await this._resolveLocator(this.languageDropdown);
        await dropLoc.click();

        const langOption = await this._resolveLocator(`text=${language}`);
        await langOption.click();
    }

    async isPaymentFormDisplayed() {
        try {
            const cardLoc = await this._resolveLocator(this.cardNumberInput);
            return await cardLoc.isVisible({ timeout: 10000 });
        } catch {
            return false;
        }
    }

    async getPayableAmount() {
        const amountLoc = await this._resolveLocator(this.totalPayableLoc);
        return await amountLoc.innerText();
    }
}

module.exports = PaymentPage;