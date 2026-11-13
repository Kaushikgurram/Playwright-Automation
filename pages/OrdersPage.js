const { BasePage } = require('./BasePage');

class OrdersPage extends BasePage {
   constructor(page) {
      super(page);
      this.table = page.locator('tbody');
      this.rows = page.locator('tbody tr');
      this.detailOrderId = page.locator('.col-text');
      this.detailAddresses = page.locator('.address');
      this.detailProduct = page.locator('.artwork-card-info .title');
      this.backToOrdersButton = page.locator('.btn-container .btn');
   }
   row(orderId) {
      return this.rows.filter({ hasText: orderId });
   }
   async viewOrder(orderId) {
      await this.table.waitFor();
      await this.click(this.row(orderId).locator('button').first());
   }
   async backToOrders() {
      await this.click(this.backToOrdersButton);
      await this.table.waitFor();
   }
   async deleteOrder(orderId) {
      await this.click(this.row(orderId).getByRole('button', { name: 'Delete' }));
   }
}

module.exports = { OrdersPage };
