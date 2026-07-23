const BasePage = require("./BasePage");

class PropertyPage extends BasePage {

    constructor(page) {
        super(page);

        this.hotelsTab = page.getByRole('button', { name: 'Hotels' });
        this.resortsTab = page.getByRole('button', { name: 'Resorts' });
        this.homeStaysTab = page.getByRole('button', { name: 'Home Stays' });
        this.campsTab = page.getByRole('button', { name: 'Camps & Tents' });
    }

    async clickHotels() {
        await this.hotelsTab.click();
    }

    async clickResorts() {
        await this.resortsTab.click();
    }

    async clickHomeStays() {
        await this.homeStaysTab.click();
    }

    async clickCamps() {
        await this.campsTab.click();
    }
}

module.exports = PropertyPage;