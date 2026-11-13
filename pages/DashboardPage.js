const { BasePage } = require('./BasePage');

class DashboardPage extends BasePage {
   constructor(page) {
      super(page);
      this.products = page.locator('.card-body');
      this.titles = page.locator('.card-body b');
      this.cartLink = page.locator("[routerlink*='cart']");
      this.ordersLink = page.locator("button[routerlink*='myorders']");
      this.cartCount = this.cartLink.locator('label');
      this.signOutButton = page.getByRole('button', { name: 'Sign Out' });
      this.toast = page.locator('#toast-container');
      this.searchBox = page.locator("[name='search']:visible");
      this.minPrice = page.locator("[name='minPrice']:visible");
      this.maxPrice = page.locator("[name='maxPrice']:visible");
      this.resultsCount = page.locator('#res');
      // product details, opened with the View button
      this.detailsName = page.locator('.rtl-text h2');
      this.detailsPrice = page.locator('.rtl-text h3');
      this.detailsAddToCart = page.locator('.product-buttons button');
      this.continueShopping = page.locator('a.continue');
   }
   async waitForProducts() {
      await this.titles.first().waitFor();
   }
   async getProductTitles() {
      await this.waitForProducts();
      return this.titles.allTextContents();
   }
   card(productName) {
      return this.products.filter({ has: this.page.locator('b', { hasText: new RegExp(`^${productName}$`, 'i') }) });
   }
   async addToCart(productName) {
      await this.waitForProducts();
      await this.click(this.card(productName).locator('button:has-text("Add To Cart")'));
   }
   // filters on the left of the catalogue; they are applied with Enter
   async search(keyword) {
      await this.fill(this.searchBox, keyword);
      await this.press(this.searchBox, 'Enter');
   }
   async filterByPrice(min, max) {
      await this.fill(this.minPrice, String(min));
      await this.fill(this.maxPrice, String(max));
      await this.press(this.maxPrice, 'Enter');
   }
   // name: a category, sub category or "search for" option, e.g. 'electronics'
   filterCheckbox(name) {
      return this.page.locator('.form-group:visible')
         .filter({ has: this.page.getByText(name, { exact: true }) }).locator('input');
   }
   async viewProduct(productName) {
      await this.waitForProducts();
      await this.click(this.card(productName).getByRole('button', { name: 'View' }));
      await this.detailsName.waitFor();
   }
   async addToCartFromDetails() {
      await this.click(this.detailsAddToCart);
   }
   async backToCatalogue() {
      await this.click(this.continueShopping);
      await this.waitForProducts();
   }
   async signOut() {
      await this.click(this.signOutButton);
   }
   async openCart() {
      await this.click(this.cartLink);
   }
   async openOrders() {
      await this.click(this.ordersLink);
   }
}

module.exports = { DashboardPage };
