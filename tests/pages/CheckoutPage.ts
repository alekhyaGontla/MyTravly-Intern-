import { Page, Locator } from '@playwright/test';

export class CheckoutPage {
  readonly page: Page;

  // Header and Timer Elements
  readonly timerBar: Locator;
  
  // Hotel details
  readonly hotelName: Locator;
  readonly roomDetails: Locator;
  readonly specialRequestInput: Locator;

  // Price and Coupons
  readonly priceDetailsHeading: Locator;
  readonly basePriceValue: Locator;
  readonly discountValue: Locator;
  readonly totalPayableValue: Locator;
  readonly appliedCouponBadge: Locator;
  readonly useCouponLink: Locator;
  readonly couponInput: Locator;
  readonly applyCouponBtn: Locator;
  readonly removeCouponLink: Locator;
  readonly invalidCouponPopup: Locator;

  // Guest Details
  readonly step2Heading: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly proceedToPaymentBtn: Locator;
  readonly validationErrorMsg: Locator;
  
  // Optional Fields
  readonly promoEmailCheckbox: Locator;
  readonly companyDetailsToggle: Locator;
  readonly companyNameInput: Locator;
  readonly gstInput: Locator;
  readonly specialRequestAccordionToggle: Locator;

  // Payment Flow (Step 3)
  readonly step3Heading: Locator;
  readonly guestDetailsSummary: Locator;
  readonly mealPlanDetails: Locator;
  readonly checkInDateText: Locator;
  readonly checkOutDateText: Locator;
  readonly priceDetailsSummary: Locator;
  readonly upiTab: Locator;
  readonly cardsTab: Locator;
  readonly netBankingTab: Locator;
  readonly walletTab: Locator;
  readonly generateQRCodeBtn: Locator;
  readonly editGuestDetailsBtn: Locator;
  readonly saveChangesAndUpdatePaymentBtn: Locator;
  readonly paymentSuccessMsg: Locator;

  constructor(page: Page) {
    this.page = page;

    // Locators based on the screenshots
    this.timerBar = page.getByText(/Time Remaining/i).first();
    
    // Using a more general text locator for the hotel details area
    this.hotelName = page.locator('h2').first(); 
    this.roomDetails = page.getByText(/1 room|room/i).first();
    this.mealPlanDetails = page.getByText(/Meal Plan/i).first();
    this.checkInDateText = page.getByText(/Check-in :/i).first();
    this.checkOutDateText = page.getByText(/Check-Out :/i).first();
    this.priceDetailsSummary = page.getByText(/Price details|₹|Total payable amount/i).first();
    this.specialRequestInput = page.getByPlaceholder(/Enter any special requests/i).first();

    this.priceDetailsHeading = page.getByText('Price details', { exact: true }).first();
    this.appliedCouponBadge = page.getByText(/Coupon Applied/i).first();
    
    // We assume the prices follow a standard layout (e.g., right-aligned next to their labels).
    // These specific locators might need tweaking depending on the exact DOM structure.
    this.basePriceValue = page.locator('text=/1 room.*night/i').locator('..').locator('span, div').last(); 
    this.discountValue = page.locator('text=/Total Discount/i').locator('..').locator('span, div').last();
    this.totalPayableValue = page.locator('text=/Total payable amount/i').locator('..').locator('span, div').last();
    
    // Coupon Section
    this.useCouponLink = page.getByText('Use a coupon, credit, or promotion code').first();
    this.couponInput = page.getByPlaceholder(/Enter promo code/i).first();
    this.applyCouponBtn = page.getByRole('button', { name: /Apply/i }).first();
    this.removeCouponLink = page.getByText('Remove', { exact: true }).or(page.getByText('Clear', { exact: true })).first();
    this.invalidCouponPopup = page.getByText(/invalid coupon code/i).first();

    // Guest Details Section
    this.step2Heading = page.getByText(/Step 2 of 3/i).first();
    
    // We assume the 4 text inputs under "Who's checking in" are First Name, Last Name, Email, Phone
    // We'll use a container approach to avoid matching the coupon input
    const guestSection = page.locator(':has-text("Who\'s checking in")').last();
    // In many SPAs, the last element containing the text is the actual container, but a safer fallback:
    // We can also select the inputs based on their likely order on the page if they don't have placeholders.
    // Let's use a generic approach assuming these are the primary form inputs on this part of the page.
    this.firstNameInput = page.locator('input[type="text"], input:not([type])').nth(1); // 0 might be coupon, so let's rely on standard form filling if we can, or just generic nth.
    // Actually, a safer approach without knowing the DOM is to rely on labels or placeholders if they exist, but since they are pre-filled in the screenshot with junk, we will use a generic nth relative to the form.
    // Assuming the guest details are a standard block:
    this.firstNameInput = page.getByPlaceholder(/first name/i).or(page.locator('input[name*="first" i]')).or(page.locator('input').nth(1)).first(); 
    this.lastNameInput = page.getByPlaceholder(/last name/i).or(page.locator('input[name*="last" i]')).or(page.locator('input').nth(2)).first();
    this.emailInput = page.getByPlaceholder(/email/i).or(page.locator('input[type="email"]')).or(page.locator('input').nth(3)).first();
    this.phoneInput = page.getByPlaceholder(/phone|mobile|contact/i).or(page.locator('input[type="tel"]')).or(page.locator('input').nth(4)).first();
    
    this.proceedToPaymentBtn = page.getByRole('button', { name: /Proceed to payment/i }).first();
    this.validationErrorMsg = page.locator('.error-message, .validation-error, [role="alert"]').first();

    // Optional Fields
    this.promoEmailCheckbox = page.locator('input[type="checkbox"][name*="promo"], input[type="checkbox"][name*="marketing"]').first();
    this.companyDetailsToggle = page.getByText(/I have a company\/GST/i).or(page.getByText(/Enter company details/i)).first();
    this.companyNameInput = page.getByPlaceholder(/Company Name/i).or(page.locator('input[name*="companyName"]')).first();
    this.gstInput = page.getByPlaceholder(/GST Number/i).or(page.locator('input[name*="gst"]')).first();
    this.specialRequestAccordionToggle = page.getByText(/Special Request/i).first();

    // Payment Flow Section
    this.step3Heading = page.getByText(/Step 3 of 3/i).first();
    this.guestDetailsSummary = page.getByText(/Guest Details/i).first(); // The summary box header
    this.upiTab = page.getByText('UPI', { exact: true }).first();
    this.cardsTab = page.getByText('Cards', { exact: true }).first();
    this.netBankingTab = page.getByText('Net Banking', { exact: true }).first();
    this.walletTab = page.getByText('Wallet', { exact: true }).first();
    this.generateQRCodeBtn = page.getByRole('button', { name: /Generate QR Code/i }).first();
    // Target the Edit button specifically (using word boundary \bEdit\b so it never matches "credit" in coupon/card text)
    this.editGuestDetailsBtn = page.getByText(/\bEdit\b/i).filter({ hasNotText: /Guest Details|Primary/i }).first();
    this.saveChangesAndUpdatePaymentBtn = page.getByRole('button', { name: /Save Changes & Update Payment/i }).or(page.getByText('Save Changes & Update Payment', { exact: false })).first();
    this.paymentSuccessMsg = page.getByText(/Payment order generated successfully/i).first();
  }

  async expandCouponSection() {
    await this.useCouponLink.click();
  }

  async enterAndApplyCoupon(couponCode: string) {
    await this.couponInput.fill(couponCode);
    await this.applyCouponBtn.click();
  }

  // Helper method to parse currency strings (e.g. "₹1,080.25" -> 1080.25)
  async getNumericValue(locator: Locator): Promise<number> {
    const text = await locator.innerText();
    const numericString = text.replace(/[^0-9.]/g, '');
    return parseFloat(numericString);
  }

  async fillGuestDetails(firstName: string, lastName: string, email: string, phone: string) {
    // Fill the guest details form
    // Note: Due to lack of direct DOM access, these nth locators might need tweaking 
    // depending on the actual HTML structure (e.g., if there are hidden inputs).
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.emailInput.fill(email);
    await this.phoneInput.fill(phone);
  }

  async proceedToPayment() {
    await this.proceedToPaymentBtn.click();
  }

  async selectPaymentMethod(method: 'UPI' | 'Cards' | 'Net Banking' | 'Wallet') {
    switch(method) {
      case 'UPI':
        await this.upiTab.click();
        break;
      case 'Cards':
        await this.cardsTab.click();
        break;
      case 'Net Banking':
        await this.netBankingTab.click();
        break;
      case 'Wallet':
        await this.walletTab.click();
        break;
    }
  }

  async clickEditGuestDetails() {
    await this.editGuestDetailsBtn.click({ force: true });
  }

  async updateFirstName(newFirstName: string) {
    await this.firstNameInput.clear();
    await this.firstNameInput.fill(newFirstName);
  }

  async saveChangesAndUpdatePayment() {
    await this.saveChangesAndUpdatePaymentBtn.click({ force: true });
  }
}
