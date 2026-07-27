import { test, expect, Page } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { PropertyDetailsPage } from '../pages/PropertyDetailsPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test.describe('Property Details Flow', () => {
  test('MTW-TC-10: Property details and check-in/out display', async ({ page }) => {
    const propertyDetailsPage = await navigateToPropertyDetails(page);

    // Verify critical elements on the property details page
    await expect(propertyDetailsPage.propertyTitle).toBeVisible({ timeout: 15000 });
    await expect(propertyDetailsPage.selectRoomBtn).toBeVisible();
    await expect(propertyDetailsPage.viewAllPhotosBtn).toBeVisible();

    // 1. Review the property description
    await expect(propertyDetailsPage.aboutHeading).toBeVisible();
    await expect(propertyDetailsPage.propertyDescriptionText).toBeVisible({ timeout: 15000 });

    // 2. Review location map pin and address
    await expect(propertyDetailsPage.exploreAreaHeading).toBeVisible();
    await expect(propertyDetailsPage.locationMapPin).toBeVisible({ timeout: 15000 });
    await expect(propertyDetailsPage.mapContainer).toBeVisible({ timeout: 15000 });

    // 3. Verify the displayed check-in and check-out timings under Hotel Policies
    await expect(propertyDetailsPage.hotelPoliciesHeading).toBeVisible();
    await expect(propertyDetailsPage.checkInTimeText).toBeVisible({ timeout: 15000 });
    await expect(propertyDetailsPage.checkOutTimeText).toBeVisible({ timeout: 15000 });

    // Assert that at least one "Book Now" button is present (meaning room cards loaded)
    await expect(propertyDetailsPage.bookNowBtns.first()).toBeVisible();
  });

  // Helper method for navigation
  async function navigateToPropertyDetails(page: Page) {
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
    return new PropertyDetailsPage(detailsPage);
  }

  // MTW-TC-28 / MTW-SCN-28: Room selection, meal plan, Book Now, and checkout summary verification
  test('MTW-TC-11: Room selection and Book Now opens booking modal', async ({ page }) => {
    const propertyDetailsPage = await navigateToPropertyDetails(page);
    await expect(propertyDetailsPage.chooseRoomHeading).toBeVisible({ timeout: 15000 });
    
    // 1. Select a room type and meal plan on a room card (Select "Breakfast Included")
    const breakfastOption = propertyDetailsPage.page.getByText(/Breakfast Included/i).first();
    const hasBreakfast = await breakfastOption.isVisible().catch(() => false);
    if (hasBreakfast) {
      await breakfastOption.click();
    } else if (await propertyDetailsPage.mealPlanRadios.count() > 1) {
      await propertyDetailsPage.mealPlanRadios.nth(1).check();
    }
    
    // 2. Click Book Now on that card
    await propertyDetailsPage.bookNowBtns.first().click();
    
    // 3. Click confirm and secure my stay in the modal
    await expect(propertyDetailsPage.confirmAndSecureBtn).toBeVisible({ timeout: 15000 });
    await propertyDetailsPage.confirmAndSecureBtn.click();
    
    // 4. Verify the selected room, meal plan, dates and total are preserved in the checkout modal/summary
    const detailsPage = propertyDetailsPage.page;
    await detailsPage.waitForURL(/checkout|booking/i, { timeout: 20000 });
    const checkoutPage = new CheckoutPage(detailsPage);
    
    await expect(checkoutPage.timerBar).toBeVisible({ timeout: 15000 });
    await expect(checkoutPage.roomDetails).toBeVisible({ timeout: 15000 });
    await expect(checkoutPage.mealPlanDetails).toBeVisible({ timeout: 15000 });
    if (hasBreakfast) {
      await expect(detailsPage.getByText(/Breakfast Included/i).first()).toBeVisible({ timeout: 15000 });
    }
    await expect(checkoutPage.checkInDateText).toBeVisible({ timeout: 15000 });
    await expect(checkoutPage.checkOutDateText).toBeVisible({ timeout: 15000 });
    await expect(checkoutPage.priceDetailsSummary).toBeVisible({ timeout: 15000 });
  });

  // HB-024 / MTW-SCN-29: Property details share action
  // Expected: A share option opens without changing the booking state.
  test('MTW-TC-30: Property details Share action', async ({ page }) => {
    const propertyDetailsPage = await navigateToPropertyDetails(page);
    
    // Click share button
    await propertyDetailsPage.shareBtn.click();
    
    // Verify modal opens with sharing link and options
    await expect(propertyDetailsPage.page.getByText('Share this property', { exact: false }).first()).toBeVisible({ timeout: 15000 });
    await expect(propertyDetailsPage.page.getByText('Or copy link', { exact: false }).or(propertyDetailsPage.page.getByRole('button', { name: /Copy/i })).first()).toBeVisible({ timeout: 15000 });
    await expect(propertyDetailsPage.shareModal).toBeVisible({ timeout: 15000 });
    
    // URL shouldn't have moved to checkout
    expect(propertyDetailsPage.page.url()).not.toContain('checkout');
  });

  // MTW-TC-30 / MTW-SCN-30: Reviews and ratings display - scroll down to review section and click all reviews
  test('MTW-TC-12: Reviews and ratings display', async ({ page }) => {
    const propertyDetailsPage = await navigateToPropertyDetails(page);
    
    // 1. Scroll down to the reviews and ratings section (or click the sticky Reviews tab)
    await propertyDetailsPage.reviewsTab.click().catch(async () => {
      await propertyDetailsPage.reviewsRatingText.scrollIntoViewIfNeeded();
    });
    await expect(propertyDetailsPage.reviewsRatingText).toBeVisible({ timeout: 15000 });
    
    // 2. Click "Show all reviews" / all review link
    await expect(propertyDetailsPage.showAllReviewsLink).toBeVisible({ timeout: 15000 });
    await propertyDetailsPage.showAllReviewsLink.click();
    
    // 3. Verify the "All reviews" popup dialog displays the list of reviews
    await expect(propertyDetailsPage.allReviewsModalHeading).toBeVisible({ timeout: 15000 });
    await expect(propertyDetailsPage.allReviewsModalContent).toBeVisible({ timeout: 15000 });
  });
});
