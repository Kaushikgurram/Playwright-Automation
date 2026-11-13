const { BasePage } = require('./BasePage');

class GreenKartCheckoutPage extends BasePage {
   constructor(page) {
      super(page);
      this.rows = page.locator('#productCartTables tbody tr');
      this.promoCode = page.locator('.promoCode');
      this.promoButton = page.locator('.promoBtn');
      this.promoInfo = page.locator('.promoInfo');
      this.totalAmount = page.locator('.totAmt');
      this.discount = page.locator('.discountPerc');
      this.totalAfterDiscount = page.locator('.discountAmt');
      this.placeOrderButton = page.getByRole('button', { name: 'Place Order' });
      this.countrySelect = page.locator('select');
      this.agreeCheckbox = page.locator('.chkAgree');
      this.proceedButton = page.getByRole('button', { name: 'Proceed' });
      this.termsError = page.locator('.errorAlert');
      this.confirmation = page.locator('.wrapperTwo');
   }
   row(productName) {
      return this.rows.filter({ hasText: productName });
   }
   async applyPromoCode(code) {
      await this.fill(this.promoCode, code);
      await this.click(this.promoButton);
      // the button reads "Applying ..." for a few seconds; a message from an earlier code stays until then
      await this.promoButton.filter({ hasText: /^\s*Apply\s*$/ }).waitFor({ timeout: 15_000 });
      await this.promoInfo.waitFor();
      return this.getText(this.promoInfo);
   }
   async openCountryPage() {
      await this.click(this.placeOrderButton);
   }
   async selectCountry(country) {
      await this.select(this.countrySelect, country);
   }
   async agreeToTerms() {
      await this.check(this.agreeCheckbox);
   }
   async proceed() {
      await this.click(this.proceedButton);
   }
   async placeOrder(country) {
      await this.openCountryPage();
      await this.selectCountry(country);
      await this.agreeToTerms();
      await this.proceed();
   }
}

module.exports = { GreenKartCheckoutPage };
