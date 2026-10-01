// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 45_000,
  expect: {
    timeout: 7_000,
  },
  reporter: [['html'],
             ['allure-playwright', { outputFolder: 'allure-results' }]],
 webServer: {
  command: 'docker run --rm --name parabank -p 9090:8080 parasoft/parabank',
  url: 'http://localhost:9090/parabank/index.htm',
  reuseExistingServer: !process.env.CI,
  timeout: 180000,
},
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:9090/parabank/',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

