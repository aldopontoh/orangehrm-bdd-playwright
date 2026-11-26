// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const { defineBddConfig } = require('playwright-bdd');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const testDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: ['steps/**/*.steps.js', 'fixtures/bddFixtures.js'],
  outputDir: '.features-gen',
});

const AUTH_FILE = path.resolve(__dirname, 'playwright/.auth/admin.json');

module.exports = defineConfig({
  timeout: 120_000,
  expect: {
    timeout: 15_000,
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com',
    actionTimeout: 30_000,
    navigationTimeout: 45_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1440, height: 900 },
  },
  projects: [
    {
      name: 'setup',
      testDir: './setup',
      testMatch: /auth\.setup\.js/,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },
    {
      name: 'bdd-chrome',
      testDir,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        storageState: AUTH_FILE,
      },
    },
    {
      name: 'bdd-firefox',
      testDir,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Firefox'],
        storageState: AUTH_FILE,
      },
    },
    {
      name: 'bdd-edge',
      testDir,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Edge'],
        channel: 'msedge',
        storageState: AUTH_FILE,
      },
    },
  ],
});
