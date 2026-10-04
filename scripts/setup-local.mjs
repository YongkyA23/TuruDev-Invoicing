import { existsSync, writeFileSync, mkdirSync, chmodSync } from "node:fs";
import { randomBytes } from "node:crypto";
if (existsSync(".env")) {
  console.log("Existing .env preserved.");
  process.exit(0);
}
mkdirSync(".local", { recursive: true });
const password = randomBytes(24).toString("base64url");
writeFileSync(
  ".env",
  `ADMIN_EMAIL=admin@turudev.local\nADMIN_PASSWORD=${password}\nPORT=3000\nDATABASE_PATH=./data/invoices.sqlite\n`,
  { mode: 0o600 },
);
writeFileSync(".local/admin-password", password + "\n", { mode: 0o600 });
chmodSync(".env", 0o600);
console.log(
  "Local admin: admin@turudev.local. Password saved to .local/admin-password (not committed).",
);
