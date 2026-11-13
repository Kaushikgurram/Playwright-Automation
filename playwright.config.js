// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
   testDir: './tests',
   globalSetup: require.resolve('./global-setup'),
   timeout: 90_000,
   retries: process.env.CI ? 1 : 0,
   reporter: [
      ['list'],
      ['html', { open: 'never' }],
      ['allure-playwright', { resultsDir: 'allure-results', detail: false }]
   ],
   expect: { timeout: 5000 },
   use: {
      baseURL: 'https://rahulshettyacademy.com',
      ...devices['Desktop Chrome'],
      headless: process.env.HEADED ? false : true,
      launchOptions: { slowMo: process.env.HEADED ? 500 : 0 },
      screenshot: 'on',
      video: 'on',
      trace: 'retain-on-failure'
   }
});
