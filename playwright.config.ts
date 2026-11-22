import { defineConfig, devices } from '@playwright/test';

process.loadEnvFile('.env');

const PORT = 3100;

// Runs against a production build (`npm run build` first) with a fresh embedded
// database, which seeds the two demo events.
export default defineConfig({
  testDir: './e2e',
  workers: 1, // specs share one database
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    // Optional: use a system browser instead of `npx playwright install chromium`.
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } : {},
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `node -e "require('fs').rmSync('.data/e2e', { recursive: true, force: true })" && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: { PGLITE_DATA_DIR: '.data/e2e', NEXT_PUBLIC_SITE_URL: `http://localhost:${PORT}` },
  },
});
