import { randomBytes, scryptSync } from "node:crypto";
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

const { db, transaction } = await import("../server/db.mjs");
try {
  if (!(await db.prepare("SELECT id FROM admin WHERE id=1").get()))
    throw new Error("Admin account has not been initialized");
  const salt = randomBytes(16).toString("hex");
  const hash = `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
  await transaction(async () => {
    await db.prepare("UPDATE admin SET hash=? WHERE id=1").run(hash);
    await db.prepare("DELETE FROM sessions").run();
  });
  console.log("Admin password reset. All sessions revoked.");
} finally {
  await db.close();
}
