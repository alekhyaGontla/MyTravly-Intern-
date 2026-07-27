import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test.describe('Search & Discovery Negative Flow', () => {
  // MTW-TC-31 / MTW-SCN-31: Location validation message on Search tap
  test('MTW-TC-31: Location validation message on Search tap', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();
    await homePage.searchBtn.click({ force: true });
    await expect(page.getByText('Please enter a location', { exact: false }).first()).toBeVisible({ timeout: 5000 });
  });
});
