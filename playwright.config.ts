import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "node:fs";
try {
  process.loadEnvFile();
} catch (e) {
  if (e.code !== "ENOENT") throw e;
}
export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  use: {
    baseURL: "http://127.0.0.1:3200",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: {
      executablePath:
        process.env.CHROMIUM_PATH ||
        (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
      args: ["--no-sandbox"],
    },
  },
  projects: [{ name: "desktop", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "node scripts/e2e-server.mjs",
    url: "http://127.0.0.1:3200/api/health",
    reuseExistingServer: false,
    timeout: 30000,
    env: {
      PORT: "3200",
      NODE_ENV: "development",
      APP_ORIGIN: "http://127.0.0.1:3200",
      ADMIN_EMAIL: "browser@example.com",
      ADMIN_PASSWORD: "browser-test-password-only",
      MYSQL_HOST: process.env.MYSQL_HOST || "127.0.0.1",
      MYSQL_PORT: process.env.MYSQL_PORT || "3306",
      MYSQL_ADMIN_USER: process.env.MYSQL_ADMIN_USER || "root",
      MYSQL_ROOT_PASSWORD: process.env.MYSQL_ROOT_PASSWORD || "",
    },
  },
});
