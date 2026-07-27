import { test, expect } from '@playwright/test';

test.describe('Module 14: Accessibility (WCAG)', () => {

  // MTW-TC-49: Payment method keyboard accessibility
  test('MTW-TC-49: Payment method keyboard accessibility', async ({ page }) => {
    test.fail(true, 'BUG: Selectors are clickable DIV elements with no role, tabindex or keyboard semantics.');
    await page.goto('/checkout');
    // Verify payment selectors lack proper accessibility attributes
    const paymentDivs = page.locator('div:has-text("UPI"), div:has-text("Net Banking")').first();
    await expect(paymentDivs).toHaveAttribute('role', 'button', { timeout: 3000 });
  });

  // MTW-TC-50: Mobile navigation accessible names
  test('MTW-TC-50: Mobile navigation accessible names', async ({ page, isMobile }) => {
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

  // MTW-TC-51: Image alternative text quality
  test('MTW-TC-51: Image alternative text quality', async ({ page }) => {
    test.fail(true, "BUG: Images used generic labels such as 'Property', 'Guestroom' or repeated room names.");
    await page.goto('/');
    
    const firstImg = page.locator('img').first();
    const alt = await firstImg.getAttribute('alt');
    // Expect unique non-generic description
    expect(alt).not.toMatch(/Property|Guestroom|hotel|image/i);
    expect(alt?.length).toBeGreaterThan(20);
  });
});
