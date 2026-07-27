import { test, expect } from '@playwright/test';

test.describe('Module 14: Accessibility (WCAG)', () => {

  // Skipped per user instructions
  test.skip('MTW-TC-49: Payment method keyboard accessibility', async ({ page }) => {
    test.fail(true, 'BUG: Selectors are clickable DIV elements with no role, tabindex or keyboard semantics.');
    await page.goto('/checkout');
    // Verify payment selectors lack proper accessibility attributes
    const paymentDivs = page.locator('div:has-text("UPI"), div:has-text("Net Banking")').first();
    await expect(paymentDivs).toHaveAttribute('role', 'button', { timeout: 3000 });
  });

  // Skipped per user instructions
  test.skip('MTW-TC-50: Mobile navigation accessible names', async ({ page, isMobile }) => {
    test.fail(true, 'BUG: The menu and close controls were exposed as unnamed buttons.');
    await page.goto('/');

    if (isMobile) {
      const menuBtn = page.locator('button[aria-label="Menu"], .menu-icon, [aria-expanded]').first();
      const ariaLabel = await menuBtn.getAttribute('aria-label');
      expect(ariaLabel).toBe('Open menu');
    } else {
      // For non-mobile viewport, verify general navigation buttons have accessible names
      const navBtn = page.locator('nav button, header button').first();
      await expect(navBtn).toHaveAttribute('aria-label', /.+/, { timeout: 3000 });
    }
  });

  // MTW-TC-51: Image alternative text quality & gallery labeling integrity
  test('MTW-TC-51: Image alternative text quality', async ({ page }) => {
    test.fail(true, "BUG: Bathroom (4th pic) and Living room (5th pic) are mislabeled as 'Deluxe Double Bed Room Non Ac' instead of descriptive labels.");
    // 1. Navigate to Northland Residency Hotel
    await page.goto('/hotel?hotelid=vbqeUxia');
    await page.waitForLoadState('domcontentloaded');

    // 2. Click the image from the 2nd pic on the property page to open the gallery
    const secondPic = page.locator('img[alt="Deluxe Double Bed Room Non Ac"]').first();
    await secondPic.waitFor({ state: 'visible', timeout: 15000 });
    await secondPic.click({ force: true });
    await page.waitForTimeout(2000);

    // 3. Click this pic of the bathroom (4th pic) and verify that under the pic it is mislabeled as "Deluxe Double Bed Room Non Ac"
    const fourthPicThumb = page.locator('img[alt="Deluxe Double Bed Room Non Ac photo 3"]').first();
    await fourthPicThumb.waitFor({ state: 'visible', timeout: 10000 });
    await fourthPicThumb.click({ force: true });
    await page.waitForTimeout(2000);
    
    const fourthPicAlt = await fourthPicThumb.getAttribute('alt');
    // Expect the bathroom image label/alt text to correctly say Bathroom rather than "Deluxe Double Bed Room Non Ac"
    expect(fourthPicAlt).toMatch(/bathroom|washroom|toilet/i);

    // 4. Check the 2nd/5th pic and verify its label/alt text as well
    const fifthPicThumb = page.locator('img[alt="Deluxe Double Bed Room Non Ac photo 4"]').first();
    if (await fifthPicThumb.isVisible()) {
      await fifthPicThumb.click({ force: true });
      await page.waitForTimeout(2000);
    }
    const fifthPicAlt = await page.locator('img[alt="Deluxe Double Bed Room Non Ac photo 4"]').first().getAttribute('alt');
    expect(fifthPicAlt).toMatch(/living|seating|lounge|sofa/i);
  });
});
