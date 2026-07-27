import { test, expect, Page } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { PropertyDetailsPage } from '../pages/PropertyDetailsPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test.describe('Module 5: User Profile & Dashboard', () => {

  // MTW-TC-16 / MTW-SCN-16: Profile settings update / Guest Info entry
  // Since there is no user login/authorization on the platform, user profile and guest checking-in details
  // are entered during the checkout flow after reserving a room.
  test('MTW-TC-16: Guest details entry and edit during checkout', async ({ page }) => {
    // 1. Search for a hotel in Kolkata from the homepage
    const homePage = new HomePage(page);
    await homePage.navigate();
    await homePage.searchForLocation('Kolkata');
    await page.waitForURL(/search-results/);

    // 2. Click "View Property" on the first available property card
    const viewPropertyBtn = page.getByRole('button', { name: /View Property/i }).first();
    await expect(viewPropertyBtn).toBeVisible({ timeout: 15000 });

    const [newPage] = await Promise.all([
      page.context().waitForEvent('page').catch(() => page),
      viewPropertyBtn.click()
    ]);
    const detailsPage = newPage || page;
    await detailsPage.waitForLoadState('domcontentloaded');

    // 3. Scroll down and click "Book Now" on a room, then click "Confirm & Secure my stay"
    const propertyDetailsPage = new PropertyDetailsPage(detailsPage);
    await expect(propertyDetailsPage.chooseRoomHeading).toBeVisible({ timeout: 15000 });
    await propertyDetailsPage.bookFirstRoom();

    // 4. Arrive at the booking checkout page with the 10-minute session timer
    await detailsPage.waitForURL(/checkout|booking/i, { timeout: 15000 });
    const checkoutPage = new CheckoutPage(detailsPage);
    await expect(checkoutPage.timerBar).toBeVisible({ timeout: 15000 });

    // 5. In "Who's checking in" form, enter test details:
    // First Name: 'test', Last Name: 'test', Email: 'test@test.com', Phone: '9839283028' (+91)
    await checkoutPage.fillGuestDetails('test', 'test', 'test@test.com', '9839283028');

    // 6. Proceed to payment part
    await checkoutPage.proceedToPayment();

    // 7. Verify arrival at Step 3 (waiting for any "Verifying..." spinner to complete)
    const paymentIndicator = detailsPage.getByText('Step 3 of 3', { exact: false }).first();
    await expect(paymentIndicator).toBeVisible({ timeout: 20000 });

    // 8. Click "Edit" on the Guest Details summary box
    await expect(checkoutPage.editGuestDetailsBtn).toBeVisible({ timeout: 10000 });
    await checkoutPage.clickEditGuestDetails();

    // 9. Verify Step 2 (Edit Guest Details form) opens, change first name to "Tom", then save
    const step2Indicator = detailsPage.getByText(/Step 2 of 3|Edit Guest Details|Add primary guest details/i).first();
    await expect(step2Indicator).toBeVisible({ timeout: 10000 });
    await checkoutPage.updateFirstName('Tom');
    await expect(checkoutPage.saveChangesAndUpdatePaymentBtn).toBeVisible({ timeout: 10000 });
    await checkoutPage.saveChangesAndUpdatePayment();

    // 10. Verify return to Step 3, confirm name "Tom" is displayed, and verify success message
    await expect(detailsPage.getByText(/Tom/i).first()).toBeVisible({ timeout: 15000 });
    await expect(checkoutPage.paymentSuccessMsg).toBeVisible({ timeout: 15000 });
  });

});
