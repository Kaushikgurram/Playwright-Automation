const { test, expect } = require('../fixtures/customFixtures');
const { totalProducts, search, order, deals } = require('../test-data/greenkart');

const ascending = (a, b) => a - b;
const descending = (a, b) => b - a;

test.describe('GreenKart search', () => {
   test.beforeEach(async ({ greenKartPage }) => {
      await greenKartPage.goto();
   });

   test('search filters the product list', async ({ greenKartPage }) => {
      await expect(greenKartPage.productNames).toHaveCount(totalProducts);

      for (const { keyword, products } of search.cases) {
         await greenKartPage.search(keyword);
         await expect(greenKartPage.productNames).toHaveText(products.map(([name]) => name));
         for (const [name, price] of products) {
            await greenKartPage.hover(greenKartPage.product(name));
            await expect(greenKartPage.price(name)).toHaveText(String(price));
            await expect(greenKartPage.addButton(name)).toHaveText('ADD TO CART');
         }
      }

      await greenKartPage.clearSearch();
      await expect(greenKartPage.productNames).toHaveCount(totalProducts);
   });

   test('search without a match shows the empty message', async ({ greenKartPage }) => {
      for (const keyword of search.noMatches) {
         await greenKartPage.search(keyword);
         expect(await greenKartPage.isDisplayed(greenKartPage.noResults)).toBe(true);
         await greenKartPage.hover(greenKartPage.noResults);
         await expect(greenKartPage.noResults).toContainText('no products matched your search');
         await expect(greenKartPage.noResults).toContainText('Enter a different keyword and try');
         await expect(greenKartPage.productNames).toHaveCount(0);

         await greenKartPage.clearSearch();
         await expect(greenKartPage.noResults).toBeHidden();
         await expect(greenKartPage.productNames).toHaveCount(totalProducts);
      }

      // the cart is not affected by a search that finds nothing
      await greenKartPage.toggleCart();
      await expect(greenKartPage.emptyCartMessage).toContainText('You cart is empty!');
      await greenKartPage.toggleCart();
      await expect(greenKartPage.emptyCartMessage).toBeHidden();

      await greenKartPage.search(order.product);
      await greenKartPage.increaseQuantity(order.product, 2);
      await greenKartPage.addToCart(order.product);
      await greenKartPage.search(search.noMatch);
      await expect(greenKartPage.noResults).toBeVisible();
      await expect(greenKartPage.cartItemCount).toHaveText('1');
      await expect(greenKartPage.cartPrice).toHaveText(String(order.unitPrice * 3));

      await greenKartPage.toggleCart();
      await expect(greenKartPage.cartPreviewItems).toHaveCount(1);
      await expect(greenKartPage.cartPreviewItem(order.product)).toContainText('3 Nos.');
      await greenKartPage.removeFromCart(order.product);
      await expect(greenKartPage.emptyCartMessage).toBeVisible();
      await expect(greenKartPage.cartItemCount).toHaveText('0');
      await greenKartPage.toggleCart();
   });

   test('search a product, add it to cart and place the order with a promo code', async ({
      greenKartPage, greenKartCheckoutPage
   }) => {
      const total = order.unitPrice * order.quantity;

      // quantity can be changed with the + and - buttons
      await greenKartPage.search(order.product);
      await expect(greenKartPage.productNames).toHaveCount(1);
      await greenKartPage.increaseQuantity(order.product, order.quantity);
      await expect(greenKartPage.quantity(order.product)).toHaveValue(String(order.quantity + 1));
      await greenKartPage.decreaseQuantity(order.product);
      await expect(greenKartPage.quantity(order.product)).toHaveValue(String(order.quantity));
      await greenKartPage.addToCart(order.product);
      await expect(greenKartPage.addButton(order.product)).toContainText('ADDED');
      await expect(greenKartPage.cartItemCount).toHaveText('1');
      await expect(greenKartPage.cartPrice).toHaveText(String(total));

      // a second product is added and then removed again in the cart preview
      await greenKartPage.search(order.extraProduct);
      await greenKartPage.addToCart(order.extraProduct);
      await expect(greenKartPage.cartItemCount).toHaveText('2');
      await expect(greenKartPage.cartPrice).toHaveText(String(total + order.extraUnitPrice));
      await greenKartPage.toggleCart();
      await expect(greenKartPage.cartPreviewItems).toHaveCount(2);
      await greenKartPage.removeFromCart(order.extraProduct);
      await expect(greenKartPage.cartPreviewItems).toHaveCount(1);
      await expect(greenKartPage.cartPreviewItem(order.product)).toContainText(`${order.quantity} Nos.`);
      await expect(greenKartPage.cartPrice).toHaveText(String(total));
      await greenKartPage.proceedToCheckout();

      await expect(greenKartCheckoutPage.rows).toHaveCount(1);
      await expect(greenKartCheckoutPage.row(order.product)).toContainText(String(total));
      await expect(greenKartCheckoutPage.totalAmount).toHaveText(String(total));
      expect(await greenKartCheckoutPage.applyPromoCode(order.invalidPromoCode)).toBe('Invalid code ..!');
      await expect(greenKartCheckoutPage.discount).toHaveText('0%');
      expect(await greenKartCheckoutPage.applyPromoCode(order.promoCode)).toBe('Code applied ..!');
      await expect(greenKartCheckoutPage.discount).toHaveText(`${order.discountPercent}%`);
      const discounted = Number(await greenKartCheckoutPage.getText(greenKartCheckoutPage.totalAfterDiscount));
      expect(discounted).toBeCloseTo(total * (1 - order.discountPercent / 100), 2);

      // the order cannot be placed before agreeing to the terms
      await greenKartCheckoutPage.openCountryPage();
      await greenKartCheckoutPage.selectCountry(order.country);
      await greenKartCheckoutPage.proceed();
      await expect(greenKartCheckoutPage.termsError).toHaveText('Please accept Terms & Conditions - Required');
      await greenKartCheckoutPage.agreeToTerms();
      await greenKartCheckoutPage.proceed();
      await expect(greenKartCheckoutPage.confirmation).toContainText('your order has been placed successfully');
   });

   test('Top Deals opens in a new tab and can be searched and sorted', async ({ greenKartPage }) => {
      const topDeals = await greenKartPage.openTopDeals();
      await expect(topDeals.page).toHaveURL(/#\/offers/);

      for (const { keyword, results } of deals.searches) {
         await topDeals.search(keyword);
         await expect(topDeals.names).toHaveText(results);
      }
      await topDeals.search(deals.noMatch);
      await expect(topDeals.rows).toHaveText(['No data']);
      await topDeals.search('');

      // walk through the pages forwards and backwards
      const [firstPage, ...laterPages] = deals.pages;
      await expect(topDeals.names).toHaveText(firstPage);
      for (const names of laterPages) {
         await topDeals.goToPage('Next');
         await expect(topDeals.names).toHaveText(names);
      }
      await expect(topDeals.pageButton('Next')).toBeDisabled();
      await topDeals.goToPage('Previous');
      await expect(topDeals.names).toHaveText(deals.pages[deals.pages.length - 2]);
      await topDeals.goToPage('First');
      await expect(topDeals.names).toHaveText(firstPage);
      await expect(topDeals.pageButton('Previous')).toBeDisabled();
      await topDeals.goToPage('Last');
      await expect(topDeals.names).toHaveText(deals.pages[deals.pages.length - 1]);
      await topDeals.goToPage('First');

      await topDeals.setPageSize(10);
      await expect(topDeals.rows).toHaveCount(10);
      await topDeals.goToPage('Next');
      await expect(topDeals.rows).toHaveCount(deals.total - 10);
      await expect(topDeals.pageButton('Next')).toBeDisabled();
      await topDeals.goToPage('Previous');
      await expect(topDeals.rows).toHaveCount(10);
      await topDeals.setPageSize(20);
      await expect(topDeals.rows).toHaveCount(deals.total);

      await topDeals.sortByName();
      await expect(topDeals.nameHeader).toHaveAttribute('aria-sort', 'ascending');
      const names = await topDeals.getNames();
      expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
      await topDeals.sortByName();
      await expect(topDeals.nameHeader).toHaveAttribute('aria-sort', 'descending');
      expect(await topDeals.getNames()).toEqual([...names].reverse());

      await topDeals.sortByPrice();
      await expect(topDeals.priceHeader).toHaveAttribute('aria-sort', 'ascending');
      const prices = await topDeals.getPrices();
      expect(prices).toEqual([...prices].sort(ascending));
      await topDeals.sortByPrice();
      await expect(topDeals.priceHeader).toHaveAttribute('aria-sort', 'descending');
      expect(await topDeals.getPrices()).toEqual([...prices].sort(descending));

      await topDeals.sortByDiscountPrice();
      await expect(topDeals.discountPriceHeader).toHaveAttribute('aria-sort', 'ascending');
      const discountPrices = await topDeals.getDiscountPrices();
      expect(discountPrices).toEqual([...discountPrices].sort(ascending));
      await topDeals.sortByDiscountPrice();
      await expect(topDeals.discountPriceHeader).toHaveAttribute('aria-sort', 'descending');
      expect(await topDeals.getDiscountPrices()).toEqual([...discountPrices].sort(descending));

      // sorting and searching work together
      await topDeals.search(deals.keyword);
      await expect(topDeals.rows).toHaveCount(deals.results.length);
      await topDeals.sortByName();
      await expect(topDeals.names).toHaveText([...deals.results].sort());
      await topDeals.search('');
      await topDeals.setPageSize(5);
      const sorted = deals.pages.flat().sort((a, b) => a.localeCompare(b));
      await expect(topDeals.names).toHaveText(sorted.slice(0, 5));
      await topDeals.goToPage('Next');
      await expect(topDeals.names).toHaveText(sorted.slice(5, 10));
      await topDeals.goToPage('Last');
      await expect(topDeals.names).toHaveText(sorted.slice(15));

      // the shop tab is still usable after the Top Deals tab is closed
      await topDeals.page.close();
      await greenKartPage.search(deals.keyword);
      await expect(greenKartPage.productNames).toHaveCount(deals.results.length);
   });
});
