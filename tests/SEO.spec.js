import { test, expect } from '@playwright/test';

test.describe('SEO & Accessibility Tests', () => {

    test('MTW-PERF-02: Verify Viewport Meta Tag', async ({ page }) => {

        await page.goto('https://mytravaly.com', {
            waitUntil: 'domcontentloaded'
        });

        const viewport = page.locator('meta[name="viewport"]');

        await expect(viewport).toHaveCount(1);

        const content = await viewport.getAttribute('content');

        expect(content).toContain('width=device-width');
    });

    test('MTW-ACC-01: Verify Page Has H1 Heading', async ({ page }) => {

        await page.goto('https://mytravaly.com', {
            waitUntil: 'domcontentloaded'
        });

        const h1 = page.locator('h1');

        // Ensure at least one H1 exists
        const count = await h1.count();

        expect(count).toBeGreaterThan(0);

        // First H1 should be visible
        await expect(h1.first()).toBeVisible();
    });

});