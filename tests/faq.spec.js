const { test, expect } = require('@playwright/test');

test.describe('FAQ', () => {

    test('Verify FAQ section', async ({ page }) => {

        await page.goto('https://mtindia-v2-admin.onrender.com/');

        await expect(page.getByText('FAQ')).toBeVisible();
    });

});