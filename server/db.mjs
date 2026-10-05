import { AsyncLocalStorage } from "node:async_hooks";
import { createPool } from "mysql2/promise";
import { defaults } from "./domain.mjs";

const pool = createPool({
  host: process.env.MYSQL_HOST || "127.0.0.1",
  port: Number(process.env.MYSQL_PORT || 3306),
  database: process.env.MYSQL_DATABASE || "turudev",
  user: process.env.MYSQL_USER || "turudev",
  password: process.env.MYSQL_PASSWORD || "",
  waitForConnections: true,
  connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT || 10),
  charset: "utf8mb4",
});
const transactionConnection = new AsyncLocalStorage();
const connection = () => transactionConnection.getStore() || pool;

export const db = {
  prepare(sql) {
    return {
      async get(...values) {
        const [rows] = await connection().execute(sql, values);
        return rows[0];
      },
      async all(...values) {
        const [rows] = await connection().execute(sql, values);
        return rows;
      },
      async run(...values) {
        const [result] = await connection().execute(sql, values);
        return {
          changes: result.affectedRows,
          lastInsertRowid: Number(result.insertId),
        };
      },
    };
  },
  query(sql) {
    return connection().query(sql);
  },
  close() {
    return pool.end();
  },
};

for (const sql of [
  `CREATE TABLE IF NOT EXISTS admin (
    id TINYINT UNSIGNED PRIMARY KEY,
    email VARCHAR(254) NOT NULL,
    hash VARCHAR(255) NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS sessions (
    token CHAR(64) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
    csrf CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    expires BIGINT NOT NULL,
    KEY sessions_expires (expires)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS settings (
    id TINYINT UNSIGNED PRIMARY KEY,
    data LONGTEXT NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  ...["clients", "services"].map(
    (table) => `CREATE TABLE IF NOT EXISTS ${table} (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      data LONGTEXT NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  ),
  `CREATE TABLE IF NOT EXISTS invoices (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    number VARCHAR(100) NOT NULL,
    data LONGTEXT NOT NULL,
    archived TINYINT(1) NOT NULL DEFAULT 0,
    version INT UNSIGNED NOT NULL DEFAULT 1,
    created_at VARCHAR(40) NOT NULL,
    updated_at VARCHAR(40) NOT NULL,
    UNIQUE KEY invoices_number (number)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
])
  await db.query(sql);

await db.prepare("INSERT IGNORE INTO settings (id,data) VALUES (1,?)").run(
  JSON.stringify(defaults),
);

export const getSettings = async () =>
  JSON.parse((await db.prepare("SELECT data FROM settings WHERE id=1").get()).data);
export const putSettings = (data) =>
  db.prepare("UPDATE settings SET data=? WHERE id=1").run(JSON.stringify(data));
export const fromRow = (row) =>
  row && {
    ...JSON.parse(row.data),
    id: Number(row.id),
    ...(row.number !== undefined
      ? {
          number: row.number,
          archived: Boolean(row.archived),
          version: row.version,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }
      : {}),
  };
export const getInvoice = async (id) =>
  fromRow(await db.prepare("SELECT * FROM invoices WHERE id=?").get(id));

export async function transaction(fn) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await transactionConnection.run(conn, fn);
    await conn.commit();
    return result;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

export async function reserveNumber() {
  const row = await db
    .prepare("SELECT data FROM settings WHERE id=1 FOR UPDATE")
    .get();
  const settings = JSON.parse(row.data);
  let number;
  do {
    number = `${settings.prefix}-${settings.numberFormat === "year" ? new Intl.DateTimeFormat("en", { year: "numeric", timeZone: "Asia/Jakarta" }).format(new Date()) + "-" : ""}${String(settings.nextNumber++).padStart(3, "0")}`;
  } while (await db.prepare("SELECT 1 FROM invoices WHERE number=?").get(number));
  await putSettings(settings);
  return number;
}
