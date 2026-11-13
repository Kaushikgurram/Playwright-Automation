const { test, expect } = require('../fixtures/customFixtures');


test('Flipkart login', async ({ page, customClick }) => {
   const phone = "9876543210"; // replace with your mobile number
   const email = "your_email@example.com"; // replace if using email login

   await page.goto("https://www.flipkart.com/");

   // open login page if it didn't appear automatically
   const phoneField = page.getByRole("spinbutton", { name: "Phone Number" });
   if (!(await phoneField.isVisible())) {
      await customClick(page.getByRole("link", { name: "Login" }).first());
   }

   // Flipkart defaults to phone-number login (OTP sent after Continue)
   await phoneField.fill(phone);
   await customClick("button:has-text('Continue')");

   // Flipkart sends an OTP here - automation can't read it, so the test
   // pauses for manual entry when running headed:
   // await page.pause();

   /* email login instead:
   await page.getByText("Use Email-ID").click();
   await page.getByRole("textbox").first().fill(email);
   */

});
