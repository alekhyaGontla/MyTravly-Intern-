import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test.describe('Module 6: Host / Partner Extranet (B2B)', () => {

  // MTW-TC-17 / MTW-SCN-17: Host / Partner Extranet B2B portal redirection
  test('MTW-TC-17: Host / Partner Extranet B2B portal redirection', async ({ page }) => {
    // 1. Navigate to the guest-facing landing page
    await page.goto('https://mytravaly.in');
    const homePage = new HomePage(page);
    await expect(homePage.addHotelBtn).toBeVisible({ timeout: 15000 });

    // 2. Click the "Add Hotel" button which directs partners to the HBC B2B portal
    const [popup] = await Promise.all([
      page.waitForEvent('popup').catch(() => null), // handle if opened in new tab
      homePage.addHotelBtn.click()
    ]);

    // 3. Verify redirection to the B2B site (hbc.mytravaly.com)
    const targetPage = popup || page;
    await targetPage.waitForURL(/hbc\.mytravaly\.com/i, { timeout: 25000 });
    await targetPage.waitForLoadState('domcontentloaded');

    // 4. Confirm key elements of the Hotel Business Centre landing page
    expect(targetPage.url()).toContain('hbc.mytravaly.com');
    const hbcElement = targetPage.locator('h1, h2, h3, p, span, button, a, div').filter({ hasText: /Get Found|Grow Your Business|HOTEL BUSINESS CENTRE|List Property/i }).first();
    await expect(hbcElement).toBeVisible({ timeout: 15000 });
  });

});
