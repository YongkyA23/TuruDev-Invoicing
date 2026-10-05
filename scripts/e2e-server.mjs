import { spawn } from "node:child_process";
import { createConnection } from "mysql2/promise";
try {
  process.loadEnvFile();
} catch (e) {
  if (e.code !== "ENOENT") throw e;
}

const database = `turudev_e2e_test_${process.pid}`;
const mysqlAdmin = {
  host: process.env.MYSQL_HOST || "127.0.0.1",
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_ADMIN_USER || "root",
  password: process.env.MYSQL_ROOT_PASSWORD || "",
};
const admin = await createConnection(mysqlAdmin);
try {
  await admin.query(
    `CREATE DATABASE \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
} finally {
  await admin.end();
}

const child = spawn(process.execPath, ["server/index.mjs"], {
  env: {
    ...process.env,
    PORT: process.env.PORT || "3200",
    NODE_ENV: "development",
    APP_ORIGIN: process.env.APP_ORIGIN || "http://127.0.0.1:3200",
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || "browser@example.com",
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "browser-test-password-only",
    MYSQL_DATABASE: database,
    MYSQL_USER: mysqlAdmin.user,
    MYSQL_PASSWORD: mysqlAdmin.password,
  },
  stdio: "inherit",
});

for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => child.kill(signal));

const exitCode = await new Promise((resolve) =>
  child.once("exit", (code) => resolve(code ?? 1)),
);
const cleanup = await createConnection(mysqlAdmin);
try {
  await cleanup.query(`DROP DATABASE IF EXISTS \`${database}\``);
} finally {
  await cleanup.end();
}
process.exitCode = exitCode;
