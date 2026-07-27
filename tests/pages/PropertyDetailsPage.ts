import { Page, Locator } from '@playwright/test';

export class PropertyDetailsPage {
  readonly page: Page;

  // Header Elements
  readonly selectRoomBtn: Locator;

  // Gallery Elements
  readonly viewAllPhotosBtn: Locator;
  readonly propertyGalleryImages: Locator;
  
  // Header / Action Elements
  readonly shareBtn: Locator;
  readonly shareModal: Locator;

  // Navigation Tabs
  readonly overviewTab: Locator;
  readonly aboutTab: Locator;
  readonly roomsTab: Locator;
  readonly locationTab: Locator;
  readonly policiesTab: Locator;
  readonly reviewsTab: Locator;

  // Content Locators
  readonly propertyTitle: Locator;
  readonly fullAddressLink: Locator;
  readonly highlightsHeading: Locator;
  
  // Lower Content Sections
  readonly aboutHeading: Locator;
  readonly chooseRoomHeading: Locator;
  readonly bookNowBtns: Locator;
  readonly exploreAreaHeading: Locator;
  readonly hotelPoliciesHeading: Locator;
  readonly reviewsRatingText: Locator;
  readonly showAllReviewsLink: Locator;
  readonly allReviewsModalHeading: Locator;
  readonly allReviewsModalContent: Locator;
  readonly youMayAlsoLikeHeading: Locator;
  readonly mapContainer: Locator;
  readonly checkInTimeText: Locator;
  readonly checkOutTimeText: Locator;
  readonly propertyDescriptionText: Locator;
  readonly locationMapPin: Locator;
  
  // Room and Meal Plans
  readonly mealPlanRadios: Locator;
  readonly mealPlanPriceDiffs: Locator;

  constructor(page: Page) {
    this.page = page;

    // We can use getByText or getByRole depending on how the button is implemented.
    // getByText with button role fallback is usually safe.
    this.selectRoomBtn = page.getByText(/Select Room/i).first();
    this.viewAllPhotosBtn = page.getByText('View All', { exact: true }).first();
    this.propertyGalleryImages = page.locator('.gallery img, [data-testid="gallery"] img');
    
    this.shareBtn = page.getByRole('button', { name: /Share/i }).first();
    this.shareModal = page.locator('div, [role="dialog"], [class*="modal" i], [class*="popup" i]').filter({ hasText: /Share this property|Or copy link/i }).first();

    this.overviewTab = page.getByText('Overview', { exact: true }).first();
    this.aboutTab = page.getByText('About', { exact: true }).first();
    this.roomsTab = page.getByText('Rooms', { exact: true }).first();
    this.locationTab = page.getByText('Location', { exact: true }).first();
    this.policiesTab = page.getByText('Policies', { exact: true }).first();
    this.reviewsTab = page.getByText('Reviews', { exact: true }).first();

    // The property title is usually an h1 or heavily styled text
    // A generic h1 selector covers most SEO-friendly property pages
    this.propertyTitle = page.locator('h1').first();
    this.fullAddressLink = page.getByText('See full address', { exact: false }).first();
    this.highlightsHeading = page.getByText('Highlights for your trip', { exact: true }).first();
    
    // Lower Section Locators
    this.aboutHeading = page.getByText('About this property', { exact: true }).first();
    this.chooseRoomHeading = page.getByText('Choose your room', { exact: true }).first();
    this.bookNowBtns = page.getByRole('button', { name: /Book Now/i });
    this.exploreAreaHeading = page.getByText('Explore the area', { exact: true }).first();
    this.hotelPoliciesHeading = page.getByText('Hotel Policies', { exact: true }).first();
    this.reviewsRatingText = page.getByText(/verified Google reviews/i).first();
    this.showAllReviewsLink = page.getByText('Show all reviews', { exact: true }).first();
    this.allReviewsModalHeading = page.getByText('All reviews', { exact: true }).first();
    this.allReviewsModalContent = page.locator('[role="dialog"], .modal, div').filter({ hasText: /All reviews/i }).first();
    this.youMayAlsoLikeHeading = page.getByText('You may also like', { exact: true }).first();
    this.mapContainer = page.locator('.map-container, iframe[src*="maps"]').first();
    this.checkInTimeText = page.getByText(/Check-in Time/i).first();
    this.checkOutTimeText = page.getByText(/Check-out Time/i).first();
    this.propertyDescriptionText = page.locator('p, div').filter({ hasText: /Set on|offers clean|comfort for business|property|guest house/i }).first();
    this.locationMapPin = page.locator('iframe[src*="maps"], img[src*="maps"], [class*="map" i], [class*="pin" i]').or(page.getByText(/Grand Trunk Rd|Plot Number|India|Delhi|Kolkata/i)).first();
    
    // Meal Plans
    this.mealPlanRadios = page.locator('input[type="radio"][name*="meal"]');
    this.mealPlanPriceDiffs = page.locator('.meal-plan-price, .price-diff');
    
    // Booking Flow Elements
    this.confirmAndSecureBtn = page.getByRole('button', { name: /Confirm & Secure my stay/i }).first();
  }

  // Booking Flow Methods
  readonly confirmAndSecureBtn: Locator;

  async bookFirstRoom() {
    // Click the first available "Book Now" button
    await this.bookNowBtns.first().click();
    // Click the confirm button in the modal
    await this.confirmAndSecureBtn.click();
  }
}
