import { test, expect } from '@playwright/test';

test.describe('Module 7: Static & Support', () => {
  
  // MTW-TC-18: Contact Us page content verification
  test('MTW-TC-18: Contact Us page content verification', async ({ page }) => {
    // Navigate to Contact Us page (via footer link or direct endpoint)
    await page.goto('/contact-us');
    await page.waitForLoadState('domcontentloaded');

    // Verify main heading and operating hours text
    await expect(page.getByRole('heading', { name: /Contact Us/i }).first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/We are here to help! MyTravaly provides extended support/i).first()).toBeVisible();
    await expect(page.getByText(/Monday to Saturday \(8 AM to 11 PM\)/i).first()).toBeVisible();

    // Verify Reservations Centre hotline and email
    await expect(page.getByText(/\+918068507734/).first()).toBeVisible();
    await expect(page.getByText(/support@mytravaly\.com/i).first()).toBeVisible();

    // Verify Hotel Business Center contacts
    await expect(page.getByText(/hostmanagement@mytravaly\.com/i).first()).toBeVisible();
    await expect(page.getByText(/connectivity@mytravaly\.com/i).first()).toBeVisible();

    // Verify Media and Email Communication contacts
    await expect(page.getByText(/media@mytravaly\.com/i).first()).toBeVisible();
    await expect(page.getByText(/feedback@mytravaly\.com/i).first()).toBeVisible();
    await expect(page.getByText(/hr@mytravaly\.com/i).first()).toBeVisible();
    await expect(page.getByText(/payout@mytravaly\.com/i).first()).toBeVisible();
    await expect(page.getByText(/legal@mytravaly\.com/i).first()).toBeVisible();
    await expect(page.getByText(/grievance-india@mytravaly\.in/i).first()).toBeVisible();

    // Verify Postal / Mail Address
    await expect(page.getByText(/3rd Floor, Startup Park, Davanam Plaza, Hosur–Sarjapur Road/i).first()).toBeVisible();
  });

  // MTW-TC-19: FAQ accordion expand/collapse
  test('MTW-TC-19: FAQ accordion expand/collapse', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Scroll down to reveal the FAQ section at the bottom of the homepage
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // Verify key FAQ questions are visible and interactive
    const q1 = page.getByText('What can I book on MyTravaly?', { exact: false }).first();
    const q2 = page.getByText('How quickly can I confirm my booking?', { exact: false }).first();
    const q3 = page.getByText('Do I need to pay the full amount online?', { exact: false }).first();

    await q1.scrollIntoViewIfNeeded().catch(() => {});
    await expect(q1).toBeVisible({ timeout: 15000 });
    await expect(q2).toBeVisible();
    await expect(q3).toBeVisible();

    // Click to expand question 1 and verify answer reveals
    await q1.click();
    await expect(page.getByText(/discover and book hotels, resorts, homestays/i).first()).toBeVisible({ timeout: 10000 });

    // Click to expand question 2 and verify answer reveals
    await q2.click();
    await expect(page.getByText(/confirmed instantly once payment or the required advance is completed/i).first()).toBeVisible({ timeout: 10000 });
  });

  // MTW-TC-20: Guest Booking Policy link integrity
  test('MTW-TC-20: Guest Booking Policy link integrity', async ({ page }) => {
    // Navigate to Guest Booking Policy (via footer or direct URL)
    await page.goto('/guest-booking-policy');
    await page.waitForLoadState('domcontentloaded');

    // Verify page title and heading integrity
    const title = await page.title();
    expect(title).not.toMatch(/404|Not Found/i);
    await expect(page.getByRole('heading', { name: /Guest Booking Policy/i }).or(page.getByText('Guest Booking Policy', { exact: true })).first()).toBeVisible({ timeout: 15000 });

    // Verify policy overview text
    await expect(page.getByText(/This policy outlines everything you need to know for a smooth booking experience/i).first()).toBeVisible();

    // Verify key policy numbered sections
    await expect(page.getByText('1. Booking', { exact: false }).first()).toBeVisible();
    await expect(page.getByText('2. Check-In', { exact: false }).first()).toBeVisible();
    await expect(page.getByText('3. Cancellation & Refunds', { exact: false }).first()).toBeVisible();
    await expect(page.getByText('4. Contact MyTravaly', { exact: false }).first()).toBeVisible();
    await expect(page.getByText('5. Payments', { exact: false }).first()).toBeVisible();
    await expect(page.getByText('6. Additional Notes', { exact: false }).first()).toBeVisible();
    await expect(page.getByText('7. Cross-Border Transactions', { exact: false }).first()).toBeVisible();
    await expect(page.getByText('8. Disclaimer', { exact: false }).first()).toBeVisible();
  });
});
