import { rmSync } from "node:fs";
// An isolated database for this test run; never uses the real application data.
const path = process.env.DATABASE_PATH;
if (!path || !path.includes("turudev-e2e-"))
  throw new Error("Expected an isolated E2E database");
for (const suffix of ["", "-wal", "-shm"])
  rmSync(path + suffix, { force: true });
await import("../server/index.mjs");
