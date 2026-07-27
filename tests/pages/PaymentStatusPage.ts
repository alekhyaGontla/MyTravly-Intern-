import { Page, Locator } from '@playwright/test';

export class PaymentStatusPage {
  readonly page: Page;

  readonly paymentFailedHeading: Locator;
  readonly tryAgainBtn: Locator;
  readonly goToHomepageBtn: Locator;
  readonly transactionDetailsHeading: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    // Based on the payment failure screenshot
    this.paymentFailedHeading = page.getByRole('heading', { name: /Payment Failed/i }).first().or(page.getByText('Payment Failed').first());
    this.tryAgainBtn = page.getByRole('button', { name: /Try Again/i }).first();
    this.goToHomepageBtn = page.getByRole('button', { name: /Go to Homepage/i }).first();
    this.transactionDetailsHeading = page.getByText('Transaction Details', { exact: true }).first();
    this.errorMessage = page.getByText(/The transaction got failed. Please try again./i).first();
  }
}
