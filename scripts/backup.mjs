import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
try {
  process.loadEnvFile();
} catch (e) {
  if (e.code !== "ENOENT") throw e;
}

const target = resolve(
  process.env.BACKUP_PATH ||
    `data/backups/invoices-${new Date().toISOString().replace(/[:.]/g, "-")}.json`,
);
if (existsSync(target))
  throw new Error("Backup already exists; choose an unused backup destination");
mkdirSync(dirname(target), { recursive: true, mode: 0o700 });
const { db, transaction } = await import("../server/db.mjs");
try {
  const tables = ["admin", "sessions", "settings", "clients", "services", "invoices"];
  const rows = await transaction(async () =>
    Object.fromEntries(
      await Promise.all(
        tables.map(async (table) => [
          table,
          await db
            .prepare(
              `SELECT * FROM ${table} ORDER BY ${table === "sessions" ? "token" : "id"}`,
            )
            .all(),
        ]),
      ),
    ),
  );
  const backup = {
    format: "turudev-mysql-backup-v1",
    createdAt: new Date().toISOString(),
    tables: rows,
  };
  writeFileSync(target, JSON.stringify(backup), { flag: "wx", mode: 0o600 });
  console.log("MySQL backup created.");
} finally {
  await db.close();
}
