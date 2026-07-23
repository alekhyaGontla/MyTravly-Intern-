const BasePage = require("./BasePage");

class SearchPage extends BasePage {

    constructor(page) {
        super(page);

        // Search Form
        this.locationInput = "input[placeholder='Add Location']";
        this.whenField = "text=09 Jul";
        this.guestField = "text=2 Guests";
        this.searchButton = "button";

        // Calendar
        this.nextMonthButton = "button[aria-label='Next Month']";

        // Guests
        this.increaseGuest = "button:has-text('+')";
        this.decreaseGuest = "button:has-text('-')";

        // Results
        this.hotelCards = ".hotel-card";
    }

    async enterLocation(location) {
        await this.fill(this.locationInput, location);
    }

    async selectDate() {
        await this.click(this.whenField);
    }

    async increaseGuests() {
        await this.click(this.guestField);
        await this.click(this.increaseGuest);
    }

    async clickSearch() {
        await this.click(this.searchButton);
    }

    async searchHotel(location) {

        await this.enterLocation(location);

        await this.selectDate();

        await this.increaseGuests();

        await this.clickSearch();

    }

}

module.exports = SearchPage;