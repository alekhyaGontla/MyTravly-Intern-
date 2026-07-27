import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test.describe('Search & Discovery Bug Findings (Confirmed Defects)', () => {

  // MTW-TC-40 / MTW-SCN-40: Date-picker maximum stay validation
  // Expected: Verify that with a stay length beyond the maximum allowed nights, the system should reject the range and show a validation message.
  // Actual (Bug): System allows selecting and searching a 5-year stay without any error or limit in selection, instead proceeding to search results and displaying "No properties found".
  test('MTW-TC-40: Date-picker maximum stay validation', async ({ page }) => {
    test.fail(true, 'BUG: System allows selecting a 5-year stay without validation error; search executes and displays No properties found instead of rejecting range.');
    const homePage = new HomePage(page);
    await homePage.navigate();
    
    // Simulate navigating with a 5-year stay (e.g. 2026 to 2031) in URL parameters as shown in user bug reproduction
    await page.goto('/search-results?location=Kolkata&checkin=2026-07-28&checkout=2031-07-28&adults=2&rooms=1');
    await page.waitForLoadState('domcontentloaded');
    
    // We expect the system to reject the range with a validation message before or during search
    const validationMsg = page.locator('text=/maximum stay|stay length limit|invalid date range|exceeds maximum nights/i');
    await expect(validationMsg).toBeVisible({ timeout: 5000 });
  });

  // MTW-TC-41 / MTW-SCN-41: Guest age boundary classification (Skipped per user instructions - cannot be performed)
  test.skip('MTW-TC-41: Guest age boundary classification', async ({ page }) => {
    // Skipped as age boundary classification cannot be performed in this UI scope
  });

  // MTW-TC-42 / MTW-SCN-42: Search trigger date-range integrity (Skipped per user instructions)
  test.skip('MTW-TC-42: Search trigger date-range integrity', async ({ page }) => {
    // Skipped per user instructions
  });

  // MTW-TC-43 / MTW-SCN-43: Disabled Search button still responds to tap (Skipped - Not a bug)
  // Note: This is a working negative path identical to MTW-TC-31 (Location validation message on Search tap)
  test.skip('MTW-TC-43: Disabled Search button still responds to tap', async ({ page }) => {
    // Skipped: This behavior is working as expected (negative validation) and is covered under MTW-TC-31
  });
});
