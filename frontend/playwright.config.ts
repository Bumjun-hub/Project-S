import { defineConfig } from "@playwright/test";

// No arbitrary URL/reused server: this suite must never run against real accounts.
const baseURL = "http://127.0.0.1:3100";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: 2,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    browserName: "chromium",
    locale: "ko-KR",
    reducedMotion: "reduce",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1280, height: 900 } } },
    { name: "mobile", use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
  webServer: {
    command: "node scripts/e2e-server.mjs",
    url: `${baseURL}/products`,
    reuseExistingServer: false,
    timeout: 300_000,
    env: {
      PROJECT_S_E2E: "1",
      NEXT_PUBLIC_DEMO_MODE: "true",
      NEXT_PUBLIC_API_BASE_URL: "",
      SERVER_API_BASE_URL: "",
      NEXT_TELEMETRY_DISABLED: "1",
    },
  },
});
