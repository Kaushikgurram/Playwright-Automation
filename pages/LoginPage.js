const { BasePage } = require('./BasePage');

class LoginPage extends BasePage {
   constructor(page) {
      super(page);
      this.email = page.locator('#userEmail');
      this.password = page.locator('#userPassword');
      this.loginButton = page.locator("[value='Login']");
      this.toast = page.locator('#toast-container');
      this.errors = page.locator('.invalid-feedback');
   }
   async goto() {
      await this.page.goto('/client');
   }
   async submit() {
      await this.click(this.loginButton);
   }
   async login(email, password) {
      await this.fill(this.email, email);
      await this.fill(this.password, password);
      await this.submit();
      await this.page.waitForLoadState('networkidle');
   }
}

module.exports = { LoginPage };
