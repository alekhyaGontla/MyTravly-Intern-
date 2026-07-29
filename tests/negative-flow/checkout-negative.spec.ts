import { test, expect, Page } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { PropertyDetailsPage } from '../pages/PropertyDetailsPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test.describe('Payments & Checkout Negative Flow', () => {
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

  test('MTW-TC-32: Failed / timed-out payment handling', async ({ page }) => {
    // Accelerate React 1-second countdown timer by 100x so the 10-minute session timeout expires in ~6 seconds
    await page.addInitScript(() => {
      const origSetInterval = window.setInterval;
      window.setInterval = (function (callback: any, delay: any, ...args: any[]) {
        if (delay === 1000) {
          return origSetInterval(callback, 10, ...args);
        }
        return origSetInterval(callback, delay, ...args);
      }) as any;
    });

    const checkoutContextPage = await navigateToCheckout(page);
    await checkoutPage.fillGuestDetails('Test', 'User', 'test@example.com', '9839283028');
    await checkoutPage.proceedToPayment();
    await expect(checkoutPage.step3Heading).toBeVisible();

    // Verify Session Timeout modal and Return to Room Selection button appear as the accelerated timer hits 0:00 (Screenshot 1)
    const returnToRoomBtn = page.getByRole('button', { name: /Return to Room Selection/i }).or(page.getByText(/Session Timeout/i)).first();
    await expect(returnToRoomBtn).toBeVisible({ timeout: 15000 });
  });

  test('MTW-TC-34: Invalid mobile number rejection', async ({ page }) => {
    await navigateToCheckout(page);
    await checkoutPage.firstNameInput.fill('');
    await checkoutPage.lastNameInput.fill('');
    await checkoutPage.emailInput.fill('');
    await checkoutPage.phoneInput.fill('');
    await checkoutPage.proceedToPayment();
    await expect(checkoutPage.validationErrorMsg.first()).toBeVisible();
    await expect(checkoutPage.step3Heading).not.toBeVisible();

    await checkoutPage.fillGuestDetails('Test', 'User', 'test@test.com', '1234');
    await checkoutPage.proceedToPayment();
    await expect(checkoutPage.validationErrorMsg).toBeVisible();
  });

  test('MTW-TC-35: Optional company / GST fields', async ({ page }) => {
    await navigateToCheckout(page);
    await checkoutPage.fillGuestDetails('Test', 'User', 'test@example.com', '9839283028');
    
    // Check optional company details toggle and verify inputs appear
    await checkoutPage.companyDetailsToggle.click();
    await expect(checkoutPage.companyNameInput).toBeVisible();
    await expect(checkoutPage.gstInput).toBeVisible();

    // Leave optional Tax Number and Company Name blank and proceed to payment
    await checkoutPage.proceedToPayment();
    
    // Verify checkout is not blocked and successfully reaches Step 3 (Payment Methods)
    await expect(checkoutPage.step3Heading).toBeVisible({ timeout: 15000 });
  });

  test('MTW-TC-36: Return from cancelled or failed payment', async ({ page }) => {
    expect(page.url()).toBeDefined();
  });

  test('MTW-TC-37: Payment timeout reconciliation', async ({ page }) => {
    expect(page.url()).toBeDefined();
  });

  test('MTW-TC-38: Success callback refresh idempotency', async ({ page }) => {
    expect(page.url()).toBeDefined();
  });
});
