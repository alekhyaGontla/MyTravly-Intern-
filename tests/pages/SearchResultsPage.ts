import { Page, Locator } from '@playwright/test';

export class SearchResultsPage {
  readonly page: Page;
  
  // No Results Elements
  readonly noPropertiesFoundHeading: Locator;
  readonly noPropertiesMessage: Locator;
  readonly registerNowBtn: Locator;
  
  // With Results Elements
  readonly propertiesFoundText: Locator;
  readonly endOfListText: Locator;
  
  // Filters
  readonly priceRangeFilter: Locator;
  readonly specialDealsFilter: Locator;
  readonly propertyTypeFilter: Locator;
  readonly starRatingFilter: Locator;
  readonly mealsIncludedFilter: Locator;
  readonly amenitiesRulesFilter: Locator;
  readonly clearAllFiltersBtn: Locator;
  
  // Sorting & Pagination
  readonly sortSelect: Locator;
  readonly propertyCards: Locator;
  readonly propertyPrices: Locator;
  readonly nextPageBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Locators
    this.noPropertiesFoundHeading = page.getByText('No properties found', { exact: true }).first();
    this.noPropertiesMessage = page.getByText("We don't have any properties here").first();
    this.registerNowBtn = page.locator('a:has-text("Register Now"), button:has-text("Register Now"), [class*="btn" i]:has-text("Register Now")').or(page.getByText('Register Now')).first();
    
    this.propertiesFoundText = page.getByText(/Properties Found/i).first();
    this.endOfListText = page.getByText('You have reached the end of the list.', { exact: true }).first();
    
    this.priceRangeFilter = page.getByText('Price Range', { exact: true }).first();
    this.specialDealsFilter = page.getByText('Special Deals', { exact: true }).first();
    this.propertyTypeFilter = page.getByText('Property Type', { exact: true }).first();
    this.starRatingFilter = page.getByText('Star Rating', { exact: true }).first();
    this.mealsIncludedFilter = page.getByText('Meals Included', { exact: true }).first();
    this.amenitiesRulesFilter = page.getByText('Amenities & Rules', { exact: true }).first();
    this.clearAllFiltersBtn = page.getByRole('button', { name: /Clear( All)?/i }).or(page.getByText('Clear All', { exact: true })).first();
    
    // Sort & Pagination Locators
    this.sortSelect = page.getByRole('combobox').or(page.locator('select').first()).first();
    this.propertyCards = page.locator('a:has-text("View Property"), button:has-text("View Property")').or(page.locator('[class*="rounded-4xl"][class*="shadow-lg"]'));
    this.propertyPrices = page.locator('.property-card .price, article .price, .payable-price');
    this.nextPageBtn = page.getByRole('button', { name: /Next/i }).or(page.locator('a[aria-label="Next"]')).first();
  }

  async scrollToBottom() {
    // Scroll to the end of the list by pressing End or executing scroll
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }

  async applyFilter(filterName: string) {
    // Click on the text label of the filter to toggle it
    await this.page.getByText(filterName, { exact: true }).first().click();
    // Wait a short moment for any network requests to trigger
    await this.page.waitForTimeout(1000);
  }
}
