import { DatabaseSync } from "node:sqlite";
import { randomBytes, scryptSync } from "node:crypto";
import { existsSync } from "node:fs";
try {
  process.loadEnvFile();
} catch (e) {
  if (e.code !== "ENOENT") throw e;
}
const password = process.env.ADMIN_PASSWORD;
if (!password || password.length < 12 || password.length > 500)
  throw new Error(
    "Provide a strong ADMIN_PASSWORD of 12–500 characters securely",
  );
const path = process.env.DATABASE_PATH || "data/invoices.sqlite";
if (!existsSync(path))
  throw new Error("The application database does not exist");
const db = new DatabaseSync(path);
try {
  if (!db.prepare("SELECT id FROM admin WHERE id=1").get())
    throw new Error("Admin account has not been initialized");
  const salt = randomBytes(16).toString("hex");
  const hash = `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
  db.exec("BEGIN IMMEDIATE");
  db.prepare("UPDATE admin SET hash=? WHERE id=1").run(hash);
  db.prepare("DELETE FROM sessions").run();
  db.exec("COMMIT");
  console.log("Admin password reset. All sessions revoked.");
} finally {
  db.close();
}
