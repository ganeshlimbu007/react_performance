import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: '**/lab.spec.tsx',
  // The chapter 7 burst measures what React abandons under load, so these never run in parallel.
  fullyParallel: false,
  workers: 1,
  timeout: 45_000,
  reporter: [['list']],
  use: {
    browserName: 'chromium',
    // LAB_CHROME lets a sandbox point at a browser it already has.
    launchOptions: { executablePath: process.env.LAB_CHROME || undefined },
  },
});
