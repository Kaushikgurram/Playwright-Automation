const { BasePage } = require('./BasePage');

class TopDealsPage extends BasePage {
   constructor(page) {
      super(page);
      this.pageSize = page.locator('#page-menu');
      this.searchField = page.locator('#search-field');
      this.rows = page.locator('tbody tr');
      this.names = page.locator('tbody tr td:first-child');
      this.prices = page.locator('tbody tr td:nth-child(2)');
      this.discountPrices = page.locator('tbody tr td:nth-child(3)');
      this.nameHeader = page.getByRole('columnheader', { name: /Veg\/fruit name/ });
      this.priceHeader = page.getByRole('columnheader', { name: /^Price/ });
      this.discountPriceHeader = page.getByRole('columnheader', { name: /Discount price/ });
      this.pagination = page.locator('.pagination');
   }
   async search(keyword) {
      await this.fill(this.searchField, keyword);
   }
   async setPageSize(size) {
      await this.select(this.pageSize, String(size));
   }
   async sortByName() {
      await this.click(this.nameHeader);
   }
   async sortByPrice() {
      await this.click(this.priceHeader);
   }
   async sortByDiscountPrice() {
      await this.click(this.discountPriceHeader);
   }
   // name: 'First', 'Previous', 'Next' or 'Last'
   pageButton(name) {
      return this.pagination.getByRole('button', { name, exact: true });
   }
   async goToPage(name) {
      await this.click(this.pageButton(name));
   }
   getNames() {
      return this.getTexts(this.names);
   }
   async getPrices() {
      return (await this.getTexts(this.prices)).map(Number);
   }
   async getDiscountPrices() {
      return (await this.getTexts(this.discountPrices)).map(Number);
   }
}

module.exports = { TopDealsPage };
