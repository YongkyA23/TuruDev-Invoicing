import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defaults } from "../server/domain.mjs";
try {
  process.loadEnvFile();
} catch (e) {
  if (e.code !== "ENOENT") throw e;
}

const path = process.argv[2];
if (!path) throw new Error("Usage: bun run restore -- <backup.json>");
const backup = JSON.parse(readFileSync(resolve(path), "utf8"));
const tables = ["admin", "sessions", "settings", "clients", "services", "invoices"];
if (
  backup.format !== "turudev-mysql-backup-v1" ||
  tables.some((table) => !Array.isArray(backup.tables?.[table])) ||
  backup.tables.settings.length !== 1 ||
  backup.tables.settings[0].id !== 1 ||
  backup.tables.admin.length !== 1 ||
  backup.tables.admin[0].id !== 1
)
  throw new Error("Unsupported or incomplete backup file");

const { db, transaction } = await import("../server/db.mjs");
try {
  const counts = Object.fromEntries(
    await Promise.all(
      tables.map(async (table) => {
        const row = await db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get();
        return [table, Number(row.count)];
      }),
    ),
  );
  const setting = await db.prepare("SELECT id,data FROM settings WHERE id=1").get();
  const defaultSettings = setting &&
    JSON.stringify(JSON.parse(setting.data)) === JSON.stringify(defaults);
  if (
    counts.admin ||
    counts.sessions ||
    counts.clients ||
    counts.services ||
    counts.invoices ||
    (counts.settings && !defaultSettings)
  )
    throw new Error("Restore requires an empty MySQL database");

  await transaction(async () => {
    if (backup.tables.settings.length) {
      const { id, data } = backup.tables.settings[0];
      await db
        .prepare("INSERT INTO settings (id,data) VALUES (?,?) ON DUPLICATE KEY UPDATE data=VALUES(data)")
        .run(id, data);
    }
    for (const row of backup.tables.admin)
      await db.prepare("INSERT INTO admin (id,email,hash) VALUES (?,?,?)").run(
        row.id,
        row.email,
        row.hash,
      );
    for (const row of backup.tables.sessions)
      await db
        .prepare("INSERT INTO sessions (token,csrf,expires) VALUES (?,?,?)")
        .run(row.token, row.csrf, row.expires);
    for (const table of ["clients", "services"])
      for (const row of backup.tables[table])
        await db
          .prepare(`INSERT INTO ${table} (id,data) VALUES (?,?)`)
          .run(row.id, row.data);
    for (const row of backup.tables.invoices)
      await db
        .prepare("INSERT INTO invoices (id,number,data,archived,version,created_at,updated_at) VALUES (?,?,?,?,?,?,?)")
        .run(
          row.id,
          row.number,
          row.data,
          row.archived,
          row.version,
          row.created_at,
          row.updated_at,
        );
  });
  console.log("Backup restored. Verify the app before resuming normal use.");
} finally {
  await db.close();
}
