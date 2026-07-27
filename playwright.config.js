// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: false, // Disabled for safety on production
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 45000,
  
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['./utils/excelReporter.js']
  ],
  
  use: {
    baseURL: 'https://www.mytravaly.in',
    headless: true,
    actionTimeout: 10000,
    navigationTimeout: 15000,
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'Anshuman (Your Tests)',
      testMatch: '**/*.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Alekhya (Her Tests)',
      testMatch: '**/*.spec.js',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});