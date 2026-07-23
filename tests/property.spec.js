const { test, expect } = require('@playwright/test');
const PropertyPage = require('../pages/PropertyPage');

test.describe('Popular Properties', () => {

    test('Verify Popular Properties section', async ({ page }) => {

        await page.goto('https://mtindia-v2-admin.onrender.com/');

        await expect(page.getByText('Popular Properties')).toBeVisible();
    });

    test('Verify Hotels tab', async ({ page }) => {

        await page.goto('https://mtindia-v2-admin.onrender.com/');

        await page.getByRole('button', { name: 'Hotels' }).click();
    });

    test('Verify Resorts tab', async ({ page }) => {

        await page.goto('https://mtindia-v2-admin.onrender.com/');

        await page.getByRole('button', { name: 'Resorts' }).click();
    });

    test('Verify Home Stays tab', async ({ page }) => {

        await page.goto('https://mtindia-v2-admin.onrender.com/');

        await page.getByRole('button', { name: 'Home Stays' }).click();
    });

    test('Verify Camps & Tents tab', async ({ page }) => {

        await page.goto('https://mtindia-v2-admin.onrender.com/');

        await page.getByRole('button', { name: 'Camps & Tents' }).click();
    });

});