import { test, expect } from '@playwright/test';

test('MTW-EXT-01: Verify Hamburger Menu in Mobile View', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });

    // Navigate to home page
    await page.goto('https://mytravaly.com', {
        waitUntil: 'domcontentloaded'
    });

    // Wait for page to finish rendering
    await page.waitForLoadState('networkidle');

    // Possible hamburger menu locators
    const hamburger = page.locator(`
        button[aria-label*="menu" i],
        button[aria-label*="navigation" i],
        .navbar-toggler,
        .hamburger,
        .menu-toggle,
        .mobile-menu-button,
        [data-testid*="menu"]
    `).first();

    await expect(hamburger).toBeVisible({ timeout: 10000 });

    await hamburger.click();

    // Verify menu opened
    const mobileMenu = page.locator(`
        nav,
        .mobile-menu,
        .navbar-collapse,
        .menu-open,
        .drawer,
        .sidebar
    `).first();

    await expect(mobileMenu).toBeVisible({ timeout: 10000 });
});