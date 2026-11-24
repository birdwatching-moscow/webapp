import { defineConfig, devices } from '@playwright/test'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000'

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['blob'], ['list']]
    : [['html', { open: 'never' }]],

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    httpCredentials: process.env.STAGING_USER && process.env.STAGING_PASS
      ? { username: process.env.STAGING_USER, password: process.env.STAGING_PASS }
      : undefined, // Basic Auth for staging (nginx .htpasswd_staging)
  },

  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'api',
      testMatch: /api\/.+\.spec\.ts/,
      // API tests do not need a browser or storageState
    },
  ],
})
