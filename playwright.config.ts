import { defineConfig, devices } from "@playwright/test";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { existsSync } from "node:fs";
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
      DATABASE_PATH: join(tmpdir(), `turudev-e2e-${process.pid}.sqlite`),
    },
  },
});
