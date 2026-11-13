const { BasePage } = require('./BasePage');

class CheckoutPage extends BasePage {
   constructor(page) {
      super(page);
      this.country = page.getByPlaceholder('Select Country');
      this.suggestions = page.locator('.ta-results');
      this.emailLabel = page.locator(".user__name [type='text']").first();
      this.placeOrderButton = page.locator('.action__submit');
      this.confirmation = page.locator('.hero-primary');
      this.orderId = page.locator('.em-spacer-1 .ng-star-inserted');
      this.toast = page.locator('#toast-container');
      this.itemTitle = page.locator('.item__title');
      this.expiryMonth = page.locator('select.ddl').first();
      this.expiryDay = page.locator('select.ddl').last();
      this.cvv = page.locator('.field', { hasText: 'CVV Code' }).locator('input');
      this.nameOnCard = page.locator('.field', { hasText: 'Name on Card' }).locator('input');
      this.coupon = page.locator("[name='coupon']");
      this.applyCouponButton = page.getByRole('button', { name: 'Apply Coupon' });
      this.couponMessage = page.locator('.field', { has: this.coupon }).locator('p');
   }
   async fillPayment({ expiryMonth, expiryDay, cvv, nameOnCard }) {
      await this.select(this.expiryMonth, expiryMonth);
      await this.select(this.expiryDay, expiryDay);
      await this.fill(this.cvv, cvv);
      await this.fill(this.nameOnCard, nameOnCard);
   }
   async applyCoupon(code) {
      await this.fill(this.coupon, code);
      await this.click(this.applyCouponButton);
   }
   async selectCountry(search, name) {
      await this.click(this.country);
      await this.country.pressSequentially(search, { delay: 150 });
      await this.suggestions.waitFor();
      // exact match: "India" is also part of "British Indian Ocean Territory"
      await this.click(this.suggestions.locator('button', { hasText: new RegExp(`^\\s*${name}\\s*$`) }));
   }
   async placeOrder() {
      await this.click(this.placeOrderButton);
   }
   async getOrderId() {
      return (await this.orderId.textContent()).replace(/\|/g, '').trim();
   }
}

module.exports = { CheckoutPage };
