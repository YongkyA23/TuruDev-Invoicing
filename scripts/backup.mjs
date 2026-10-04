import { DatabaseSync, backup } from "node:sqlite";
import { mkdirSync, chmodSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
try {
  process.loadEnvFile();
} catch (e) {
  if (e.code !== "ENOENT") throw e;
}
const path = resolve(process.env.DATABASE_PATH || "data/invoices.sqlite");
const target = resolve(
  process.env.BACKUP_PATH ||
    `data/backups/invoices-${new Date().toISOString().replace(/[:.]/g, "-")}.sqlite`,
);
if (target === path)
  throw new Error("Backup destination must differ from the live database");
if (existsSync(target))
  throw new Error("Backup already exists; choose an unused backup destination");
mkdirSync(dirname(target), { recursive: true, mode: 0o700 });
const source = new DatabaseSync(path, { readOnly: true });
try {
  await backup(source, target);
  chmodSync(target, 0o600);
  console.log("Consistent database backup created.");
} finally {
  source.close();
}
