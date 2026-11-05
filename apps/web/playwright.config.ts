import { defineConfig, devices } from "@playwright/test";

/**
 * Uçtan uca kabul testleri. Her test kabul kriterlerindeki bir senaryoya karşılık gelir (TC-xx).
 * API ve web sunucusu otomatik başlatılır; her testten önce veriler /api/test/reset ile sıfırlanır.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false, // testler aynı bellek içi veritabanını paylaşır
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:5173",
    locale: "tr-TR",
    timezoneId: "Europe/Istanbul",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "masaüstü-chrome", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } }, testIgnore: /mobil\.spec\.ts/ },
    { name: "mobil-390", use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } }, testMatch: /mobil\.spec\.ts/ },
  ],
  webServer: [
    { command: "npm run start -w @studiopass/api", cwd: "../..", url: "http://localhost:4000/api/health", env: { E2E: "1", PORT: "4000" }, reuseExistingServer: !process.env.CI },
    { command: "npm run build && node build.mjs --serve --no-watch", url: "http://localhost:5173", reuseExistingServer: !process.env.CI },
  ],
});
