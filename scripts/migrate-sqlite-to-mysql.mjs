import { DatabaseSync } from "node:sqlite";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { defaults } from "../server/domain.mjs";
try {
  process.loadEnvFile();
} catch (e) {
  if (e.code !== "ENOENT") throw e;
}

const sourcePath = resolve(
  process.env.SQLITE_MIGRATION_PATH || "data/invoices.sqlite",
);
if (!existsSync(sourcePath))
  throw new Error(`SQLite source database not found: ${sourcePath}`);
const source = new DatabaseSync(sourcePath, { readOnly: true });
const tables = ["admin", "sessions", "settings", "clients", "services", "invoices"];
const rows = Object.fromEntries(
  tables.map((table) => [
    table,
    source
      .prepare(
        `SELECT * FROM ${table} ORDER BY ${table === "sessions" ? "token" : "id"}`,
      )
      .all(),
  ]),
);

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
    throw new Error("Migration requires an empty MySQL database");

  await transaction(async () => {
    if (rows.settings.length) {
      const { id, data } = rows.settings[0];
      await db
        .prepare("INSERT INTO settings (id,data) VALUES (?,?) ON DUPLICATE KEY UPDATE data=VALUES(data)")
        .run(id, data);
    }
    for (const row of rows.admin)
      await db.prepare("INSERT INTO admin (id,email,hash) VALUES (?,?,?)").run(
        row.id,
        row.email,
        row.hash,
      );
    for (const row of rows.sessions)
      await db
        .prepare("INSERT INTO sessions (token,csrf,expires) VALUES (?,?,?)")
        .run(row.token, row.csrf, row.expires);
    for (const table of ["clients", "services"])
      for (const row of rows[table])
        await db
          .prepare(`INSERT INTO ${table} (id,data) VALUES (?,?)`)
          .run(row.id, row.data);
    for (const row of rows.invoices)
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

  for (const table of tables) {
    const key = table === "sessions" ? "token" : "id";
    const actual = (
      await db.prepare(`SELECT ${key} FROM ${table}`).all()
    )
      .map((row) => String(row[key]))
      .sort();
    const expected = rows[table].map((row) => String(row[key])).sort();
    if (JSON.stringify(actual) !== JSON.stringify(expected))
      throw new Error(`Migration verification failed for ${table}`);
  }
  console.log(
    `Migrated SQLite data to MySQL: ${rows.admin.length} admin, ${rows.sessions.length} sessions, ${rows.clients.length} clients, ${rows.services.length} services, ${rows.invoices.length} invoices. SQLite source was left unchanged.`,
  );
} finally {
  source.close();
  await db.close();
}
