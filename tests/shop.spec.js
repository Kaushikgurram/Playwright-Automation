const { test, expect } = require('../fixtures/customFixtures');
const { validUser, invalidLogin, products, catalogue, payment, country } = require('../test-data/users');

// "$ 11500" -> 11500
const amount = text => Number(text.replace(/[^\d.]/g, ''));

test.describe('Shopping flow', () => {
   test('login shows product catalogue', async ({ loginPage, dashboardPage }) => {
      await loginPage.goto();

      // the login form validates its fields and rejects a wrong password
      await loginPage.submit();
      await expect(loginPage.errors).toHaveText(['*Email is required', '*Password is required']);
      await loginPage.login(invalidLogin.email, invalidLogin.password);
      await expect(loginPage.errors).toHaveText(['*Enter Valid Email']);
      await loginPage.login(validUser.email, invalidLogin.password);
      await expect(loginPage.toast).toContainText('Incorrect email or password.');

      await loginPage.login(validUser.email, validUser.password);
      await expect(loginPage.toast).toContainText('Login Successfully');
      const titles = await dashboardPage.getProductTitles();
      expect(titles.length).toBeGreaterThan(0);
      expect(titles).toContain(products[0]);

      // the catalogue can be filtered by name, price range and category
      for (const { keyword, results } of catalogue.searches) {
         await dashboardPage.search(keyword);
         await expect(dashboardPage.titles).toHaveText(results);
         await expect(dashboardPage.resultsCount).toContainText(`Showing ${results.length} results`);
      }
      await dashboardPage.search(catalogue.noMatch);
      await expect(dashboardPage.toast).toContainText('No Products Found');
      await expect(dashboardPage.titles).toHaveCount(0);
      await dashboardPage.search('');
      await expect(dashboardPage.titles).toHaveText(titles);

      for (const { min, max, results } of catalogue.priceRanges) {
         await dashboardPage.filterByPrice(min, max);
         await expect(dashboardPage.titles).toHaveText(results);
      }
      await dashboardPage.filterByPrice('', '');
      await expect(dashboardPage.titles).toHaveText(titles);

      await dashboardPage.check(dashboardPage.filterCheckbox(catalogue.emptyCategory));
      await expect(dashboardPage.titles).toHaveCount(0);
      await dashboardPage.uncheck(dashboardPage.filterCheckbox(catalogue.emptyCategory));
      await dashboardPage.check(dashboardPage.filterCheckbox(catalogue.category));
      await expect(dashboardPage.titles).toHaveText(titles);
      await dashboardPage.uncheck(dashboardPage.filterCheckbox(catalogue.category));

      await dashboardPage.viewProduct(products[0]);
      await expect(dashboardPage.detailsName).toHaveText(products[0]);
      await dashboardPage.backToCatalogue();
      await dashboardPage.signOut();
      await expect(loginPage.loginButton).toBeVisible();
   });

   test('add multiple items to cart', async ({ loggedInDashboard, cartPage }) => {
      // each product is searched in the catalogue, opened and added from its details page
      const prices = {};
      for (const [i, p] of products.entries()) {
         await loggedInDashboard.search(catalogue.searches[i].keyword);
         await expect(loggedInDashboard.titles).toHaveCount(1);
         await loggedInDashboard.hover(loggedInDashboard.card(p));
         await loggedInDashboard.viewProduct(p);
         await expect(loggedInDashboard.detailsName).toHaveText(new RegExp(`^${p}$`, 'i'));
         prices[p] = amount(await loggedInDashboard.getText(loggedInDashboard.detailsPrice));
         await loggedInDashboard.addToCartFromDetails();
         await expect(loggedInDashboard.toast).toContainText('Product Added To Cart');
         await loggedInDashboard.backToCatalogue();
      }

      await loggedInDashboard.openCart();
      const names = (await cartPage.getItemNames()).map(n => n.trim().toUpperCase());
      for (const p of products) expect(names).toContain(p);
      expect(names).toHaveLength(products.length);
      for (const p of products) {
         await cartPage.hover(cartPage.row(new RegExp(p, 'i')));
         expect(amount(await cartPage.getText(cartPage.price(new RegExp(p, 'i'))))).toBe(prices[p]);
         await expect(cartPage.row(new RegExp(p, 'i'))).toContainText('In Stock');
      }
      const sum = Object.values(prices).reduce((a, b) => a + b, 0);
      expect(amount(await cartPage.getText(cartPage.subtotal))).toBe(sum);
      expect(amount(await cartPage.getText(cartPage.total))).toBe(sum);

      // the cart keeps its items while the user goes back to the catalogue
      await cartPage.continueShopping();
      await loggedInDashboard.waitForProducts();
      await expect(loggedInDashboard.cartCount).toHaveText(String(products.length));
      await loggedInDashboard.openCart();
      await expect(cartPage.items).toHaveCount(products.length);
   });

   test('remove item from cart', async ({ loggedInDashboard, cartPage, checkoutPage }) => {
      // a new session starts with an empty cart
      await loggedInDashboard.openCart();
      await expect(cartPage.emptyMessage).toBeVisible();
      await cartPage.continueShopping();

      for (const [i, p] of products.entries()) {
         await loggedInDashboard.addToCart(p);
         await expect(loggedInDashboard.toast).toContainText('Product Added To Cart');
         await expect(loggedInDashboard.cartCount).toHaveText(String(i + 1));
      }
      await loggedInDashboard.openCart();
      await cartPage.getItemNames();
      await expect(cartPage.items).toHaveCount(products.length);

      await cartPage.removeItem(products[0]);
      await expect(cartPage.item(products[0])).toHaveCount(0);
      await expect(cartPage.item(products[1])).toBeVisible();
      await expect(cartPage.items).toHaveCount(products.length - 1);

      // the removal is kept after going back to the catalogue
      await cartPage.continueShopping();
      await loggedInDashboard.waitForProducts();
      await expect(loggedInDashboard.cartCount).toHaveText(String(products.length - 1));
      await loggedInDashboard.openCart();
      await expect(cartPage.items).toHaveCount(products.length - 1);
      await expect(cartPage.item(products[0])).toHaveCount(0);

      // removing the rest empties the cart
      for (const p of products.slice(1)) {
         await cartPage.hover(cartPage.row(new RegExp(p, 'i')));
         await cartPage.removeItem(new RegExp(p, 'i'));
      }
      await expect(cartPage.emptyMessage).toBeVisible();
      await expect(cartPage.items).toHaveCount(0);

      // a removed product can be added again and bought straight from the cart
      await cartPage.continueShopping();
      await loggedInDashboard.addToCart(products[0]);
      await expect(loggedInDashboard.cartCount).toHaveText('1');
      await loggedInDashboard.openCart();
      await expect(cartPage.item(products[0])).toBeVisible();
      await cartPage.buyNow(products[0]);
      await expect(checkoutPage.itemTitle).toHaveText(products[0]);
      await expect(checkoutPage.emailLabel).toHaveText(validUser.email);
   });

   test('checkout and verify order in history', async ({
      loggedInDashboard, cartPage, checkoutPage, ordersPage, loginPage
   }) => {
      await loggedInDashboard.search(catalogue.searches[0].keyword);
      await expect(loggedInDashboard.titles).toHaveText([products[0]]);
      await loggedInDashboard.addToCart(products[0]);
      await expect(loggedInDashboard.toast).toContainText('Product Added To Cart');
      await loggedInDashboard.openCart();
      await expect(cartPage.item(products[0])).toBeVisible();
      await cartPage.checkout();
      await expect(checkoutPage.itemTitle).toHaveText(products[0]);

      // the order needs a shipping country
      await checkoutPage.placeOrder();
      await expect(checkoutPage.toast).toContainText('Please Enter Full Shipping Information');

      await checkoutPage.fillPayment(payment);
      await checkoutPage.applyCoupon(payment.coupon);
      await expect(checkoutPage.couponMessage).toHaveText('* Coupon Applied', { timeout: 15_000 });
      await checkoutPage.selectCountry(country.search, country.name);
      await expect(checkoutPage.country).toHaveValue(country.name);
      await expect(checkoutPage.emailLabel).toHaveText(validUser.email);
      await checkoutPage.placeOrder();
      await expect(checkoutPage.confirmation).toHaveText(/thankyou for the order/i);
      await expect(checkoutPage.toast).toContainText('Order Placed Successfully');
      const orderId = await checkoutPage.getOrderId();

      await loggedInDashboard.openOrders();
      await expect(ordersPage.row(orderId)).toContainText(products[0]);
      await ordersPage.viewOrder(orderId);
      await expect(ordersPage.detailOrderId).toContainText(orderId);
      await expect(ordersPage.detailProduct).toHaveText(products[0]);
      await expect(ordersPage.detailAddresses).toContainText([validUser.email, validUser.email]);
      await expect(ordersPage.detailAddresses).toContainText([`Country - ${country.name}`, `Country - ${country.name}`]);

      // clean up: the order is deleted from the history again
      await ordersPage.backToOrders();
      await ordersPage.hover(ordersPage.row(orderId));
      await ordersPage.deleteOrder(orderId);
      await expect(ordersPage.row(orderId)).toHaveCount(0);
      await loggedInDashboard.signOut();
      await expect(loginPage.loginButton).toBeVisible();
   });
});
