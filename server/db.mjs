import { DatabaseSync } from "node:sqlite";
import { mkdirSync, chmodSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { defaults } from "./domain.mjs";
const path = resolve(process.env.DATABASE_PATH || "data/invoices.sqlite");
mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
export const db = new DatabaseSync(path);
chmodSync(path, 0o600);
db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
CREATE TABLE IF NOT EXISTS admin (id INTEGER PRIMARY KEY CHECK(id=1), email TEXT NOT NULL, hash TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, csrf TEXT NOT NULL, expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY CHECK(id=1), data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS clients (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS services (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS invoices (id INTEGER PRIMARY KEY AUTOINCREMENT, number TEXT NOT NULL UNIQUE COLLATE NOCASE, data TEXT NOT NULL, archived INTEGER NOT NULL DEFAULT 0, version INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);`);
db.prepare("INSERT OR IGNORE INTO settings (id,data) VALUES (1,?)").run(
  JSON.stringify(defaults),
);
export const getSettings = () =>
  JSON.parse(db.prepare("SELECT data FROM settings WHERE id=1").get().data);
export const putSettings = (data) =>
  db.prepare("UPDATE settings SET data=? WHERE id=1").run(JSON.stringify(data));
export const fromRow = (r) =>
  r && {
    ...JSON.parse(r.data),
    id: Number(r.id),
    ...(r.number !== undefined
      ? {
          number: r.number,
          archived: Boolean(r.archived),
          version: r.version,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        }
      : {}),
  };
export const getInvoice = (id) =>
  fromRow(db.prepare("SELECT * FROM invoices WHERE id=?").get(id));
export function transaction(fn) {
  db.exec("BEGIN IMMEDIATE");
  try {
    const r = fn();
    db.exec("COMMIT");
    return r;
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}
export function reserveNumber() {
  const s = getSettings();
  let number;
  do {
    number = `${s.prefix}-${s.numberFormat === "year" ? new Intl.DateTimeFormat("en", { year: "numeric", timeZone: "Asia/Jakarta" }).format(new Date()) + "-" : ""}${String(s.nextNumber++).padStart(3, "0")}`;
  } while (db.prepare("SELECT 1 FROM invoices WHERE number=?").get(number));
  putSettings(s);
  return number;
}
