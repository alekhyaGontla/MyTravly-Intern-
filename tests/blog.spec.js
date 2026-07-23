const { test, expect } = require('@playwright/test');

test.describe('Blogs', () => {

    test('Verify Explore India section', async ({ page }) => {

        await page.goto('https://mtindia-v2-admin.onrender.com/');

        await expect(page.getByText('Explore India')).toBeVisible();
    });

    test('Verify Blogs section', async ({ page }) => {

        await page.goto('https://mtindia-v2-admin.onrender.com/');

        await expect(page.getByText('Blogs')).toBeVisible();
    });

});