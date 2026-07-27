import { test, expect } from '@playwright/test';

test.describe('Static & Support Bug Findings (Confirmed Defects)', () => {
  // MTW-TC-39 / MTW-SCN-39: 'Visit Help Center' link is broken (404)
  test("MTW-TC-39: 'Visit Help Center' link is broken (404)", async ({ page }) => {
    test.fail(true, "BUG: 'Visit Help Center' on Contact Us page redirects to helpdesk.mytravaly.com/portal/en/kb which returns 'Sorry! The requested URL was not found.'");
    
    // 1. Navigate to Contact Us page where 'Visit Help Center' is located
    await page.goto('/contact-us');
    await page.waitForLoadState('domcontentloaded');

    // 2. Locate and click 'Visit Help Center →' link under FAQ section
    const helpCenterLink = page.getByRole('link', { name: /Visit Help Center/i }).or(page.getByText('Visit Help Center', { exact: false })).first();
    await expect(helpCenterLink).toBeVisible({ timeout: 15000 });
    
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page').catch(() => page),
      helpCenterLink.click()
    ]);
    const targetPage = newPage || page;
    await targetPage.waitForLoadState('domcontentloaded');

    // 3. Assert that the destination URL should NOT display the broken helpdesk error page.
    // Since the bug exists on production, this assertion will fail on targetPage, satisfying test.fail(true) as a confirmed bug finding!
    await expect(targetPage.getByText(/The requested URL was not found|Sorry!/i).first()).not.toBeVisible({ timeout: 10000 });
  });
});
