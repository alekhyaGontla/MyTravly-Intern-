import { test, expect, Page } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { PropertyDetailsPage } from '../pages/PropertyDetailsPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test.describe('Payments & Checkout Bug Findings (Confirmed Defects)', () => {
  let checkoutPage: CheckoutPage;

  async function navigateToCheckout(page: Page) {
    const homePage = new HomePage(page);
    await homePage.navigate();
    await homePage.searchForLocation('Kolkata');
    await page.waitForURL(/search-results/);

    const viewPropertyBtn = page.getByRole('button', { name: /View Property/i }).first();
    await expect(viewPropertyBtn).toBeVisible({ timeout: 15000 });

    const [newPage] = await Promise.all([
      page.context().waitForEvent('page').catch(() => page),
      viewPropertyBtn.click()
    ]);

    const detailsPage = newPage || page;
    await detailsPage.waitForLoadState('domcontentloaded');

    const propertyDetailsPage = new PropertyDetailsPage(detailsPage);
    await expect(propertyDetailsPage.chooseRoomHeading).toBeVisible({ timeout: 15000 });
    await propertyDetailsPage.bookFirstRoom();

    await detailsPage.waitForURL(/checkout/);
    checkoutPage = new CheckoutPage(detailsPage);
    return detailsPage;
  }

  test('MTW-TC-44: Midnight rollover / timezone validation at checkout', async ({ page }) => {
    test.fail(true, 'BUG: Booking proceeds for a past check-in date without server-side validation.');
    const checkoutContextPage = await navigateToCheckout(page);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 5, 0, 0);
    await checkoutContextPage.clock.setFixedTime(tomorrow);
    await checkoutPage.fillGuestDetails('Test', 'User', 'test@example.com', '9999999999');
    await checkoutPage.proceedToPayment();
    const dateError = checkoutContextPage.getByText(/check-in date is in the past/i);
    await expect(dateError).toBeVisible();
  });

  test('MTW-TC-45: Checkout session timer persistence', async ({ page }) => {
    test.fail(true, 'BUG: Timer resets to 10:00 on every refresh, crashes on timeout.');
    const checkoutContextPage = await navigateToCheckout(page);
    await expect(checkoutPage.timerBar).toBeVisible();
    await checkoutContextPage.waitForTimeout(3000);
    await checkoutContextPage.reload();
    await checkoutContextPage.waitForLoadState('domcontentloaded');
    const postRefreshText = await checkoutPage.timerBar.innerText();
    // We expect timer to persist uninterrupted at 09:56 or lower, but since it resets to 10:00, this assertion fails
    expect(postRefreshText).toContain('09:56');
  });

  test('MTW-TC-46: Guest email address validation', async ({ page }) => {
    test.fail(true, 'BUG: Email is accepted because only @ and . are checked.');
    await navigateToCheckout(page);
    await checkoutPage.fillGuestDetails('Test', 'User', 'asdsgsi@sdhd.dj', '9999999999');
    await checkoutPage.proceedToPayment();
    await expect(checkoutPage.validationErrorMsg).toBeVisible();
    await expect(checkoutPage.validationErrorMsg).toContainText(/invalid email/i);
  });

  test('MTW-TC-47: Special request field length boundary', async ({ page }) => {
    test.fail(true, 'BUG: Unlimited-length text is accepted, no maxlength constraint.');
    await navigateToCheckout(page);
    const basePriceBefore = await checkoutPage.getNumericValue(checkoutPage.basePriceValue);
    await checkoutPage.specialRequestAccordionToggle.click();
    const longString = 'A'.repeat(5001);
    await checkoutPage.specialRequestInput.fill(longString);
    const inputValue = await checkoutPage.specialRequestInput.inputValue();
    expect(inputValue.length).toBeLessThan(501);
    const basePriceAfter = await checkoutPage.getNumericValue(checkoutPage.basePriceValue);
    expect(basePriceAfter).toEqual(basePriceBefore);
  });

  test('MTW-TC-48: Coupon discount calculation integrity', async ({ page }) => {
    test.fail(true, 'BUG: Room base price inflates from ₹5,500 to ₹8,250 before calculating 40% discount (deceptive pricing math error on Akino Luxury).');
    // 1. Select Akino Luxury property
    await page.goto('/hotel?hotelid=qpXBtuMO');
    await page.waitForLoadState('domcontentloaded');

    // 2. Select the Premium Luxury room and click Book Now
    const premiumLuxuryCard = page.locator('div').filter({ hasText: /^Premium Luxury/i }).filter({ has: page.getByRole('button', { name: /Book Now/i }) }).first();
    await premiumLuxuryCard.getByRole('button', { name: /Book Now/i }).first().click();

    // Confirm & secure stay in popup modal
    const confirmBtn = page.getByRole('button', { name: /Confirm & Secure/i });
    await confirmBtn.waitFor({ state: 'visible', timeout: 10000 });
    await confirmBtn.click();

    await page.waitForURL(/checkout/, { timeout: 25000 });
    checkoutPage = new CheckoutPage(page);
    await page.waitForLoadState('domcontentloaded');

    // 3. Scroll down to the price details section as specified
    const priceDetailsSection = page.getByText(/Price details/i).first();
    await priceDetailsSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000); // Pause so initial ₹5,500 price is clearly visible in UI mode

    const basePriceBefore = await checkoutPage.getNumericValue(checkoutPage.basePriceValue);
    await checkoutPage.expandCouponSection();
    await checkoutPage.enterAndApplyCoupon('GREATSTAY');
    await expect(checkoutPage.appliedCouponBadge).toBeVisible();
    // Explicitly scroll back up to Price Details and hover it so Playwright UI captures a clear DOM snapshot of the inflated price!
    await priceDetailsSection.scrollIntoViewIfNeeded();
    await priceDetailsSection.hover();
    await page.waitForTimeout(3000);

    const basePriceAfter = await checkoutPage.getNumericValue(checkoutPage.basePriceValue);
    const discountAmount = await checkoutPage.getNumericValue(checkoutPage.discountValue);
    expect(basePriceAfter).toEqual(basePriceBefore);
    const expectedDiscount = parseFloat((basePriceBefore * 0.4).toFixed(2));
    expect(discountAmount).toBeCloseTo(expectedDiscount, 0);
  });

  test('MTW-TC-52: Selected room name integrity in checkout', async ({ page }) => {
    test.fail(true, "BUG: Checkout booking page displays '1 room : Superior room, 1 king bed' instead of selected 'Super Deluxe Double Bed Room Non Ac' with Breakfast Included.");
    await page.goto('/hotel?hotelid=vbqeUxia&check_in=2026-07-27&check_out=2026-07-28&adults=2&children=0&rooms=1');
    await page.waitForLoadState('domcontentloaded');

    // 1. Locate Super Deluxe Double Bed Room Non Ac card and select Breakfast Included meal plan
    const superDeluxeCard = page.locator('div').filter({ hasText: /^Super Deluxe Double Bed Room Non Ac/i }).filter({ has: page.getByRole('button', { name: /Book Now/i }) }).first();
    const breakfastOption = superDeluxeCard.getByText(/Breakfast Included/i).first();
    await breakfastOption.click();
    await page.waitForTimeout(1000);

    // 2. Click Book Now
    await superDeluxeCard.getByRole('button', { name: /Book Now/i }).first().click();

    // 3. Confirm & secure stay in popup modal
    const confirmBtn = page.getByRole('button', { name: /Confirm & Secure/i });
    await confirmBtn.waitFor({ state: 'visible', timeout: 10000 });
    await confirmBtn.click();

    // 4. Verify on booking/checkout page that room name is incorrectly displayed as 'Superior room, 1 king bed'
    await page.waitForURL(/checkout/, { timeout: 25000 });
    checkoutPage = new CheckoutPage(page);
    await expect(checkoutPage.roomDetails).toBeVisible();
    
    // Explicitly scroll to and hover over room details so Playwright UI trace captures a clean DOM snapshot of the discrepancy
    await checkoutPage.roomDetails.scrollIntoViewIfNeeded();
    await checkoutPage.roomDetails.hover();
    await page.waitForTimeout(3000);

    const roomText = await checkoutPage.roomDetails.textContent();
    expect(roomText).toContain('Super Deluxe Double Bed Room Non Ac');
  });

  // Skipped per user instructions
  test.skip('MTW-TC-53: Promotional-email consent default state', async ({ page }) => {
    test.fail(true, "BUG: Promotional email checkbox is pre-checked while Declaration states 'We do not send promotional emails'.");
    await navigateToCheckout(page);
    const isChecked = await checkoutPage.promoEmailCheckbox.isChecked();
    expect(isChecked).toBe(false);
  });

  // Skipped per user instructions
  test.skip('MTW-TC-54: Currency precision consistency', async ({ page }) => {
    test.fail(true, "BUG: Some totals appeared as INR 4,990.5 and 490.5 rather than two decimal places.");
    await navigateToCheckout(page);
    const totalText = await checkoutPage.totalPayableValue.innerText();
    // We expect strict 2-decimal formatting without floating point truncation
    expect(totalText).toBe('INR 4,990.50 (Exact precision verified)');
  });
});
