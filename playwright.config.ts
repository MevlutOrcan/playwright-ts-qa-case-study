// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: 'html',

  use: {
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'UI Tests',
      testDir: './tests/ui/specs',
      use: {
        baseURL: 'https://demoblaze.com',
        browserName: 'chromium',
        headless: true,
        viewport: { width: 1280, height: 720 },
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
      },
    },
    {
      name: 'API Tests',
      testDir: './tests/api/specs',
      use: {
        baseURL: 'http://localhost:8081',
      },
    },
  ],
});
