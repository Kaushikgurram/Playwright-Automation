const { BasePage } = require('./BasePage');

class CartPage extends BasePage {
   constructor(page) {
      super(page);
      this.items = page.locator('.cart li');
      this.checkoutButton = page.getByRole('button', { name: 'Checkout' });
      this.continueShoppingButton = page.getByRole('button', { name: 'Continue Shopping' });
      this.emptyMessage = page.getByRole('heading', { name: 'No Products in Your Cart !' });
      this.subtotal = page.locator('.totalRow', { hasText: 'Subtotal' }).locator('.value');
      this.total = page.locator('.totalRow', { hasText: /^Total/ }).locator('.value');
   }
   item(productName) {
      return this.page.locator('h3', { hasText: productName });
   }
   async getItemNames() {
      await this.page.locator('div li').first().waitFor();
      return this.page.locator('.cartSection h3').allTextContents();
   }
   row(productName) {
      return this.items.filter({ has: this.item(productName) });
   }
   price(productName) {
      return this.row(productName).locator('.prodTotal p');
   }
   async removeItem(productName) {
      await this.click(this.row(productName).locator('button.btn-danger'));
   }
   async buyNow(productName) {
      await this.click(this.row(productName).getByRole('button', { name: 'Buy Now' }));
   }
   async continueShopping() {
      await this.click(this.continueShoppingButton);
   }
   async checkout() {
      await this.click(this.checkoutButton);
   }
}

module.exports = { CartPage };
