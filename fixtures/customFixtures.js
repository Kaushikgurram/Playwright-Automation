const base = require('@playwright/test');
const { highlightAndClick } = require('../utils/actions');
const { LoginPage } = require('../pages/LoginPage');
const { DashboardPage } = require('../pages/DashboardPage');
const { CartPage } = require('../pages/CartPage');
const { CheckoutPage } = require('../pages/CheckoutPage');
const { OrdersPage } = require('../pages/OrdersPage');
const { BasePage } = require('../pages/BasePage');
const { GreenKartPage } = require('../pages/GreenKartPage');
const { GreenKartCheckoutPage } = require('../pages/GreenKartCheckoutPage');
const { validUser } = require('../test-data/users');

exports.test = base.test.extend({
   // usage: await customClick('#submit') or await customClick(page.getByRole('button'))
   customClick: async ({ page }, use) => {
      await use((target, options) =>
         highlightAndClick(typeof target === 'string' ? page.locator(target) : target, options));
   },

   // all reusable actions without a page object, each with the red box:
   // await actions.hover('#menu'); await actions.select(page.getByLabel('Country'), 'India')
   actions: async ({ page }, use) => use(new BasePage(page)),

   loginPage: async ({ page }, use) => use(new LoginPage(page)),
   dashboardPage: async ({ page }, use) => use(new DashboardPage(page)),
   cartPage: async ({ page }, use) => use(new CartPage(page)),
   checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
   ordersPage: async ({ page }, use) => use(new OrdersPage(page)),
   greenKartPage: async ({ page }, use) => use(new GreenKartPage(page)),
   greenKartCheckoutPage: async ({ page }, use) => use(new GreenKartCheckoutPage(page)),

   // logged-in dashboard, ready to shop
   loggedInDashboard: async ({ loginPage, dashboardPage }, use) => {
      await loginPage.goto();
      await loginPage.login(validUser.email, validUser.password);
      await dashboardPage.waitForProducts();
      await use(dashboardPage);
   },

   // auto fixture: always attach a final screenshot, pass or fail
   _finalShot: [async ({ page }, use, testInfo) => {
      await use();
      if (!page.isClosed()) {
         await testInfo.attach('final-state', {
            body: await page.screenshot({ fullPage: true }),
            contentType: 'image/png'
         });
      }
   }, { auto: true }]
});

exports.expect = base.expect;
