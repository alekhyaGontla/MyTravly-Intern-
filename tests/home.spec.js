const { test, expect } = require('@playwright/test');
const HomePage = require('../pages/HomePage');

test.describe('Home Page - Core UI Elements Verification', () => {

    let home;

    test.beforeEach(async ({ page }) => {
        home = new HomePage(page);
        await home.openHomePage();
        
        // Ensure network is idle or logo is visible before checking remaining elements
        await page.waitForLoadState('domcontentloaded');
        await expect(home.logo).toBeVisible({ timeout: 15000 });
    });

    test('Verify Home Page header elements load successfully', async () => {
        await expect(home.logo).toBeVisible({ timeout: 10000 });
        await expect(home.addHotelButton).toBeVisible({ timeout: 10000 });
        await expect(home.getAppButton).toBeVisible({ timeout: 10000 });
    });

    test('Verify Search Bar and Filter controls are displayed', async () => {
        await expect(home.locationBox).toBeVisible({ timeout: 10000 });
        await expect(home.dateBox).toBeVisible({ timeout: 10000 });
        await expect(home.guestBox).toBeVisible({ timeout: 10000 });
        await expect(home.searchButton).toBeVisible({ timeout: 10000 });
    });

    test('Verify Popular Properties section is displayed', async () => {
        // Scroll down to trigger lazy loading if necessary
        await home.popularProperties.scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => {});
        await expect(home.popularProperties).toBeVisible({ timeout: 10000 });
    });

});