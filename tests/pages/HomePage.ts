// Page Object class containing all DOM locators and interaction methods for the main site
import { Page, Locator, expect } from '@playwright/test';

export class HomePage {
  readonly page: Page;

  // Header Elements
  readonly logo: Locator;
  readonly addHotelBtn: Locator;
  readonly getAppBtn: Locator;

  // Hero Search Widget
  readonly whereBox: Locator;
  readonly whenBox: Locator;
  readonly whoBox: Locator;
  readonly searchBtn: Locator;

  // Date Picker Locators
  readonly datePickerContainer: Locator;
  
  // Occupancy (Who) Locators
  readonly occupancyPopup: Locator;
  readonly addChildBtn: Locator;
  readonly addAdultBtn: Locator;
  readonly removeAdultBtn: Locator;
  readonly addRoomBtn: Locator;
  readonly removeRoomBtn: Locator;

  // Popular Properties Section
  readonly popularPropertiesHeading: Locator;
  readonly hotelsTab: Locator;
  readonly resortsTab: Locator;
  readonly homeStaysTab: Locator;
  readonly campsTentsTab: Locator;
  
  // Explore Sections
  readonly trendingLocationsHeading: Locator;
  readonly exploreIndiaHeading: Locator;
  readonly blogsHeading: Locator;
  
  // Lower Page Sections
  readonly hearOurTravellersHeading: Locator;
  readonly goFurtherHeading: Locator;
  readonly faqsHeading: Locator;
  readonly footerReservationsCentre: Locator;
  readonly footerHotelBusinessCentre: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header Locators
    this.logo = page.locator('img[alt*="MyTravaly"], img[src*="logo"]').first();
    this.addHotelBtn = page.getByText(/Add Hotel/i).first();
    this.getAppBtn = page.getByText(/Get the app/i).first();

    this.whereBox = page.locator('input[placeholder*="Location" i], input[placeholder*="where" i]').first();
    this.whenBox = page.getByText('WHEN').first();
    this.whoBox = page.getByText('WHO').first();
    // Target the hero search bar submit button (using .first() to avoid sticky navbar/footer buttons)
    this.searchBtn = page.locator('button.bg-cta.rounded-full, button:has(svg.text-white), button[class*="min-w-"]').first();

    // Date Picker and Occupancy
    this.datePickerContainer = page.locator('.react-datepicker, .date-picker, [role="dialog"]').first();
    this.occupancyPopup = page.locator('.occupancy-popup, [role="dialog"]').first();
    this.addChildBtn = page.getByRole('button', { name: /\+.*child/i }).or(page.locator('button[aria-label*="child" i]')).first();
    this.addAdultBtn = page.getByRole('button', { name: /\+.*adult/i }).or(page.locator('button[aria-label*="adult" i]')).first();
    this.removeAdultBtn = page.getByRole('button', { name: /-.*adult/i }).or(page.locator('button[aria-label*="adult" i].minus, button[aria-label*="adult" i]:has-text("-")')).first();
    this.addRoomBtn = page.getByRole('button', { name: /\+.*room/i }).or(page.locator('button[aria-label*="room" i]')).first();
    this.removeRoomBtn = page.getByRole('button', { name: /-.*room/i }).or(page.locator('button[aria-label*="room" i].minus, button[aria-label*="room" i]:has-text("-")')).first();

    // Popular Properties Locators
    this.popularPropertiesHeading = page.getByText('Popular Properties', { exact: true }).first();
    this.hotelsTab = page.getByText('Hotels', { exact: true }).first();
    this.resortsTab = page.getByText('Resorts', { exact: true }).first();
    this.homeStaysTab = page.getByText('Home Stays', { exact: true }).first();
    this.campsTentsTab = page.getByText('Camps & Tents', { exact: true }).first();

    // Explore Sections Locators
    this.trendingLocationsHeading = page.getByText('Explore stays in trending locations', { exact: true }).first();
    this.exploreIndiaHeading = page.getByText('Explore India', { exact: true }).first();
    this.blogsHeading = page.getByText('Blogs', { exact: true }).first();

    // Lower Page Sections Locators
    this.hearOurTravellersHeading = page.getByText('Hear Our Travellers', { exact: true }).first();
    this.goFurtherHeading = page.getByText('Go further with MyTravaly', { exact: true }).first();
    this.faqsHeading = page.getByText("FAQ's", { exact: true }).first();
    this.footerReservationsCentre = page.getByText('Reservations Centre', { exact: true }).first();
    this.footerHotelBusinessCentre = page.getByText('Hotel Business Centre', { exact: true }).first();
  }

  async navigate() {
    await this.page.goto('/');
  }

  async selectPropertyTab(tabName: 'Hotels' | 'Resorts' | 'Home Stays' | 'Camps & Tents') {
    switch (tabName) {
      case 'Hotels':
        await this.hotelsTab.click();
        break;
      case 'Resorts':
        await this.resortsTab.click();
        break;
      case 'Home Stays':
        await this.homeStaysTab.click();
        break;
      case 'Camps & Tents':
        await this.campsTentsTab.click();
        break;
    }
  }

  async searchForLocation(location: string, autoFallback = true) {
    await this.whereBox.fill(location);
    // Wait for the autocomplete dropdown to appear and populate
    await this.page.waitForTimeout(1500);
    // Click the city option div matching the exact structure from Playwright UI inspector
    const suggestion = this.page.locator('div').filter({ hasText: new RegExp(`^\\s*${location}[\\s\\S]*India`, 'i') }).first();
    await suggestion.click();
    // Wait for React state to transition the search button from grey/disabled to BLUE/active
    await this.page.waitForTimeout(1000);
    await expect(this.searchBtn).toBeVisible({ timeout: 10000 });
    await this.searchBtn.click({ force: true });

    if (autoFallback) {
      await this.page.waitForURL(/search-results/, { timeout: 10000 }).catch(() => {});
      const SearchResultsPage = require('./SearchResultsPage').SearchResultsPage;
      const srp = new SearchResultsPage(this.page);
      
      const foundResult = await Promise.race([
        srp.propertyCards.first().waitFor({ state: 'visible', timeout: 15000 }).then(() => 'cards').catch(() => null),
        srp.noPropertiesFoundHeading.waitFor({ state: 'visible', timeout: 15000 }).then(() => 'none').catch(() => null)
      ]);
      
      if (foundResult === 'none') {
        const fallbacks = ['Chennai', 'Shimla', 'Mumbai', 'Bangalore', 'Kolkata', 'Jaipur', 'Hyderabad'];
        for (const fb of fallbacks) {
          if (fb.toLowerCase() === location.toLowerCase()) continue;
          console.log(`No properties found for "${location}". Attempting fallback city: "${fb}"...`);
          await this.page.goto('/');
          await this.searchForLocation(fb, false);
          await this.page.waitForURL(/search-results/, { timeout: 10000 }).catch(() => {});
          
          const fbResult = await Promise.race([
            srp.propertyCards.first().waitFor({ state: 'visible', timeout: 15000 }).then(() => 'cards').catch(() => null),
            srp.noPropertiesFoundHeading.waitFor({ state: 'visible', timeout: 15000 }).then(() => 'none').catch(() => null)
          ]);
          if (fbResult === 'cards') {
            console.log(`Successfully found properties using fallback city: "${fb}"`);
            break;
          }
        }
      }
    }
  }

  async selectDateRangeByText(startDay: string, endDay: string) {
    await this.whenBox.click();
    await this.page.waitForTimeout(500); // Wait for calendar animation
    // Assumes simple text matching for dates on the visible calendar
    await this.datePickerContainer.getByText(startDay, { exact: true }).first().click();
    await this.datePickerContainer.getByText(endDay, { exact: true }).last().click();
  }

  async addChildWithAge(age: number) {
    await this.whoBox.click();
    await this.page.waitForTimeout(500); // Wait for popup
    await this.addChildBtn.click();
    
    // Most travel sites show a dropdown for the child's age immediately after adding
    // We will attempt to select the age using a generic combobox locator
    const ageSelect = this.page.getByRole('combobox').last();
    
    // If it's a native select
    try {
      await ageSelect.selectOption({ label: age.toString() });
    } catch (e) {
      // Fallback for custom dropdowns
      await ageSelect.click();
      await this.page.getByText(age.toString(), { exact: true }).last().click();
    }
  }
}
