import { Page, Locator } from '@playwright/test';

export class PayUCheckoutPage {
  readonly page: Page;
  
  readonly cardNumberInput: Locator;
  readonly expiryInput: Locator;
  readonly cvvInput: Locator;
  readonly nameOnCardInput: Locator;
  readonly proceedBtn: Locator;
  readonly continueWithoutSavingBtn: Locator;
  readonly transactionFailedText: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Locators on PayU page
    // We use a mix of placeholders and generic input selectors since we are on an external gateway
    // and don't have direct access to the DOM structure beforehand.
    this.cardNumberInput = page.getByText('Card Number').locator('..').locator('input').first().or(page.locator('input[id*="card"]').first());
    this.expiryInput = page.getByText('Expiry').locator('..').locator('input').first().or(page.locator('input[id*="exp"]').first());
    this.cvvInput = page.getByText('CVV').locator('..').locator('input').first().or(page.locator('input[id*="cvv"]').first());
    this.nameOnCardInput = page.getByText('Name on Card').locator('..').locator('input').first().or(page.locator('input[id*="name"]').first());
    
    this.proceedBtn = page.getByRole('button', { name: /PROCEED/i }).first();
    
    // Modal
    this.continueWithoutSavingBtn = page.getByRole('button', { name: /CONTINUE WITHOUT SAVING/i }).first();
    
    // Error message on PayU page
    this.transactionFailedText = page.getByText('Transaction Failed!', { exact: false }).first();
  }
  
  async fillCardDetails(cardNumber: string, expiry: string, cvv: string, name: string) {
    // Fill the inputs, adding fallback selectors just in case
    await this.page.waitForLoadState('networkidle');
    
    // Many payment gateways use iframes for PCI compliance. 
    // If Playwright fails to find the inputs on the main page, it means we need to look into frames.
    // For now, assuming it's a redirect based on the URL bar in the screenshot (api.payu.in)
    
    // Use generic typing as a fallback if strict locators fail on the external site
    try {
      await this.cardNumberInput.fill(cardNumber);
      await this.expiryInput.fill(expiry);
      await this.cvvInput.fill(cvv);
      await this.nameOnCardInput.fill(name);
    } catch (e) {
      // Fallback to purely generic if structural locators fail on 3rd party site
      const inputs = this.page.locator('input[type="text"], input[type="tel"], input[type="password"]');
      await inputs.nth(0).fill(cardNumber);
      await inputs.nth(1).fill(expiry);
      await inputs.nth(2).fill(cvv);
      await inputs.nth(3).fill(name);
    }
  }

  async proceed() {
    await this.proceedBtn.click();
  }

  async handleSaveCardModal() {
    // If the modal pops up, click continue without saving
    try {
      await this.continueWithoutSavingBtn.waitFor({ state: 'visible', timeout: 5000 });
      await this.continueWithoutSavingBtn.click();
    } catch (e) {
      // Modal might not appear, which is fine
    }
  }
}
