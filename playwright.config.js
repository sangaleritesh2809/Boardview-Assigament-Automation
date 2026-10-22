const { defineConfig, devices } = require('@playwright/test');
require('dotenv').config();

module.exports = defineConfig({
  testDir: './tests',
  timeout: 180 * 1000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: false,
  workers: 1,
  /* टेस्ट फेल झाल्यावर पुन्हा रन न करता लगेच थांबवणे (Stop immediately on failure) */
  retries: 0,
  maxFailures: 1,
  reporter: [
    ['html', { open: 'never' }],
    ['list']
  ],
  use: {
    baseURL: process.env.BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'off',
    video: 'off',
  },
  projects: [
    {
      name: 'msedge',
      use: {
        ...devices['Desktop Edge'],
        channel: 'msedge' // Uses installed Microsoft Edge
      },
    },
  ],
});
