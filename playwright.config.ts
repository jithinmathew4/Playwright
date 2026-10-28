import { defineConfig, devices } from '@playwright/test';

/**
 * Load optional local settings (DB_CLIENT, DATABASE_URL) from .env – see .env.example.
 * The tests and the webServer both inherit these variables.
 */
try {
  process.loadEnvFile();
} catch {
  // No .env file: use the defaults (SQLite).
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL for the self-hosted Task app. External-site tests use absolute URLs. */
    baseURL: 'http://127.0.0.1:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    /* Tests against public demo sites (JSONPlaceholder, The Internet, SauceDemo). */
    {
      name: 'external',
      testIgnore: '**/TaskApp/**',
      use: { ...devices['Desktop Chrome'] },
    },
    /* API, DB and UI tests against the self-hosted Task app in app/. */
    {
      name: 'app',
      testDir: './tests/TaskApp',
      testIgnore: '**/perf/**',
      use: { ...devices['Desktop Chrome'] },
    },
    /* Performance budgets for the Task app. Retries would hide slow runs, so they are off. */
    {
      name: 'perf',
      testDir: './tests/TaskApp/perf',
      retries: 0,
      use: { ...devices['Desktop Chrome'] },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Start the Task app (and reset its database) before the tests run. */
  webServer: {
    command: 'npm run app:start',
    url: 'http://127.0.0.1:3000/api/health',
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
  },
});
