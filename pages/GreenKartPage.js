const { BasePage } = require('./BasePage');
const { TopDealsPage } = require('./TopDealsPage');

class GreenKartPage extends BasePage {
   constructor(page) {
      super(page);
      this.searchBox = page.getByPlaceholder('Search for Vegetables and Fruits');
      this.products = page.locator('.products .product');
      this.productNames = page.locator('.products h4.product-name');
      this.noResults = page.locator('.no-results');
      this.cartItemCount = page.locator('.cart-info tr', { hasText: 'Items' }).locator('strong');
      this.cartPrice = page.locator('.cart-info tr', { hasText: 'Price' }).locator('strong');
      this.cartIcon = page.locator('a.cart-icon');
      this.cartPreview = page.locator('.cart-preview');
      this.cartPreviewItems = page.locator('.cart-preview li.cart-item');
      this.emptyCartMessage = page.locator('.cart-preview .empty-cart');
      this.proceedToCheckoutButton = page.getByRole('button', { name: 'PROCEED TO CHECKOUT' });
      this.topDealsLink = page.getByRole('link', { name: 'Top Deals' });
   }
   async goto() {
      await this.page.goto('/seleniumPractise/#/', { waitUntil: 'domcontentloaded' });
      await this.productNames.first().waitFor();
   }
   async search(keyword) {
      await this.searchBox.clear();
      await this.type(this.searchBox, keyword);
   }
   async clearSearch() {
      await this.fill(this.searchBox, '');
   }
   product(name) {
      return this.products.filter({ has: this.page.locator('h4', { hasText: name }) });
   }
   price(name) {
      return this.product(name).locator('.product-price');
   }
   quantity(name) {
      return this.product(name).locator('input.quantity');
   }
   addButton(name) {
      return this.product(name).getByRole('button');
   }
   // the + and - buttons next to the quantity
   async increaseQuantity(name, times = 1) {
      for (let i = 0; i < times; i++) await this.click(this.product(name).locator('.increment'));
   }
   async decreaseQuantity(name, times = 1) {
      for (let i = 0; i < times; i++) await this.click(this.product(name).locator('.decrement'));
   }
   async addToCart(name, quantity = 1) {
      if (quantity !== 1) await this.fill(this.quantity(name), String(quantity));
      await this.click(this.addButton(name));
   }
   // the cart icon opens and closes the cart preview
   async toggleCart() {
      await this.click(this.cartIcon);
   }
   cartPreviewItem(name) {
      return this.cartPreviewItems.filter({ hasText: name });
   }
   async removeFromCart(name) {
      await this.click(this.cartPreviewItem(name).locator('.product-remove'));
   }
   async proceedToCheckout() {
      if (!await this.proceedToCheckoutButton.isVisible()) await this.toggleCart();
      await this.click(this.proceedToCheckoutButton);
   }
   // Top Deals opens in a new browser tab
   async openTopDeals() {
      return new TopDealsPage(await this.clickForNewTab(this.topDealsLink));
   }
}

module.exports = { GreenKartPage };
