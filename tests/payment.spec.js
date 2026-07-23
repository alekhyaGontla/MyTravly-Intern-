const { test, expect } = require('@playwright/test');

/**
 * Resilient helper function with broader button selector fallbacks 
 * and explicit waiting for hotel details page elements.
 */
async function navigateToCheckout(page) {
  // 1. Open MyTravaly Homepage
  await page.goto('https://www.mytravaly.in/');
  await page.waitForLoadState('domcontentloaded');

  const firstProperty = page.getByRole('link', { name: 'View Property', exact: true }).first();
  await expect(firstProperty).toBeVisible({ timeout: 15000 });
  await firstProperty.scrollIntoViewIfNeeded();

  // 2. Safely capture navigation whether it opens a new tab or transitions within the same tab
  const [newPage] = await Promise.all([
    page.context().waitForEvent('page', { timeout: 5000 }).catch(() => null),
    firstProperty.click({ force: true }),
  ]);

  const propertyPage = newPage || page;
  await propertyPage.waitForLoadState('domcontentloaded');

  // 3. Locate "Book Now" or alternative CTA buttons with extended selectors & timeout
  const bookNowBtn = propertyPage.locator(
    'button:has-text("Book Now"), a:has-text("Book Now"), button:has-text("Reserve"), a:has-text("Reserve"), button.book-now, a.book-now'
  ).first();

  await expect(bookNowBtn).toBeVisible({ timeout: 20000 });
  await bookNowBtn.scrollIntoViewIfNeeded();
  await bookNowBtn.click({ force: true });

  // 4. Confirm stay inside the popup modal (if present)
  const confirmBtn = propertyPage.getByRole('button', { name: /confirm & secure my stay|confirm|proceed/i }).first();
  if (await confirmBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await confirmBtn.scrollIntoViewIfNeeded();
    await confirmBtn.click({ force: true });
  }

  // 5. Ensure the guest details input form or checkout container is loaded
  const firstNameField = propertyPage.getByPlaceholder(/first name/i).first();
  await expect(firstNameField).toBeVisible({ timeout: 20000 });
  
  return propertyPage;
}

test.describe('MyTravaly Booking & Payment Flow', () => {
  let checkoutPage;

  test.beforeEach(async ({ page }) => {
    checkoutPage = await navigateToCheckout(page);
  });

  test('TC1: Successful redirection to Payment Gateway with valid guest details', async () => {
    await checkoutPage.getByPlaceholder(/first name/i).first().fill('John');
    await checkoutPage.getByPlaceholder(/last name/i).first().fill('Doe');
    await checkoutPage.getByPlaceholder(/email/i).first().fill('john.doe@example.com');

    const phoneInput = checkoutPage.getByPlaceholder(/phone|mobile/i).first();
    if (await phoneInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await phoneInput.fill('9876543210');
    }

    const paymentBtn = checkoutPage.getByRole('button', { name: /proceed|pay|continue/i }).first();
    await expect(paymentBtn).toBeEnabled();
    await paymentBtn.click({ force: true });

    await expect(checkoutPage).toHaveURL(/.*(payment|checkout|razorpay|pay).*/i, { timeout: 15000 });
  });

  test('TC2: Prevent submission when mandatory guest details are missing', async () => {
    const paymentBtn = checkoutPage.getByRole('button', { name: /proceed|pay|continue/i }).first();
    await paymentBtn.click({ force: true });

    const firstNameInput = checkoutPage.getByPlaceholder(/first name/i).first();
    const isValid = await firstNameInput.evaluate((el) => el.checkValidity());
    expect(isValid).toBe(false);
  });

  test('TC3: Validate error state on invalid email format', async () => {
    await checkoutPage.getByPlaceholder(/first name/i).first().fill('Jane');
    await checkoutPage.getByPlaceholder(/last name/i).first().fill('Smith');
    await checkoutPage.getByPlaceholder(/email/i).first().fill('invalid-email-format');

    const paymentBtn = checkoutPage.getByRole('button', { name: /proceed|pay|continue/i }).first();
    await paymentBtn.click({ force: true });

    const emailInput = checkoutPage.getByPlaceholder(/email/i).first();
    const isValid = await emailInput.evaluate((el) => el.checkValidity());
    expect(isValid).toBe(false);
  });

  test('TC4: Apply coupon code and verify error on invalid promo code', async () => {
    const couponInput = checkoutPage.getByPlaceholder(/coupon|promo/i).first();
    const applyBtn = checkoutPage.getByRole('button', { name: /apply/i }).first();

    if (await couponInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await couponInput.fill('INVALIDCODE123');
      await applyBtn.click({ force: true });

      await expect(
        checkoutPage.getByText(/invalid|expired|not applicable/i).first()
      ).toBeVisible({ timeout: 5000 });
    } else {
      test.skip(true, 'Coupon module is not enabled for this room selection');
    }
  });

  test('TC5: Verify booking summary pricing displays correct monetary values', async () => {
    const totalAmount = checkoutPage.getByText(/₹|total/i).first();
    await expect(totalAmount).toBeVisible({ timeout: 10000 });

    const textContent = await totalAmount.textContent();
    expect(textContent).toMatch(/₹\s*[0-9,]+/);
  });
});