import {
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  chmodSync,
} from "node:fs";
import { randomBytes } from "node:crypto";
mkdirSync(".local", { recursive: true });
const existing = existsSync(".env") ? readFileSync(".env", "utf8") : "";
const lines = existing
  .split(/\r?\n/)
  .filter(
    (line) =>
      !line.startsWith("DATABASE_PATH=") && line !== "NODE_ENV=development",
  );
const values = Object.fromEntries(
  lines
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index), line.slice(index + 1)];
    }),
);
const generated = {
  ADMIN_EMAIL: "admin@turudev.local",
  ADMIN_PASSWORD: randomBytes(24).toString("base64url"),
  PORT: "3000",
  APP_ORIGIN: "http://localhost:3000",
  MYSQL_HOST: "127.0.0.1",
  MYSQL_PORT: "3306",
  MYSQL_DATABASE: "turudev",
  MYSQL_USER: "turudev",
  MYSQL_PASSWORD: randomBytes(24).toString("base64url"),
  MYSQL_ROOT_PASSWORD: randomBytes(24).toString("base64url"),
};
const additions = Object.entries(generated)
  .filter(([key]) => !values[key])
  .map(([key, value]) => `${key}=${value}`);
const oldPath = existing.match(/^DATABASE_PATH=(.*)$/m)?.[1];
if (oldPath && !values.SQLITE_MIGRATION_PATH)
  additions.push(`SQLITE_MIGRATION_PATH=${oldPath}`);
const content = [...lines.filter(Boolean), ...additions].join("\n") + "\n";
writeFileSync(".env", content, { mode: 0o600 });
const adminPassword = values.ADMIN_PASSWORD || generated.ADMIN_PASSWORD;
const mysqlRootPassword = values.MYSQL_ROOT_PASSWORD || generated.MYSQL_ROOT_PASSWORD;
if (!values.ADMIN_PASSWORD)
  writeFileSync(".local/admin-password", adminPassword + "\n", { mode: 0o600 });
writeFileSync(".local/mysql-root-password", mysqlRootPassword + "\n", {
  mode: 0o600,
});
chmodSync(".env", 0o600);
console.log(existing
  ? "Added local MySQL configuration; existing admin settings were preserved."
  : "Local MySQL and admin credentials created. Admin password saved to .local/admin-password (not committed).");
