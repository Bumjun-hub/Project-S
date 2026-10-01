import { defineConfig } from "@playwright/test";
import browserTests from "./playwright.config";

// Reuse the isolated demo server, never the real API preview on port 3000.
export default defineConfig({
  ...browserTests,
  testDir: "./tests/screenshots",
  fullyParallel: false,
  workers: 1,
  timeout: 120_000,
  reporter: "list",
  outputDir: "test-results/screenshots",
  use: { ...browserTests.use, timezoneId: "Asia/Seoul" },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 1000 } } },
    { name: "mobile", use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
});
