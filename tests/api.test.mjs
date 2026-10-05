import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createConnection } from "mysql2/promise";
import {
  calculate,
  defaults,
  dueDate,
  invoiceSchema,
} from "../server/domain.mjs";

try {
  process.loadEnvFile();
} catch (e) {
  if (e.code !== "ENOENT") throw e;
}

const dir = mkdtempSync(join(tmpdir(), "turudev-api-"));
const port = 36000 + Math.floor(Math.random() * 3000),
  base = `http://127.0.0.1:${port}`;
const password = "test-only-password-please-replace";
const database = `turudev_api_test_${process.pid}`;
const mysqlAdmin = {
  host: process.env.MYSQL_HOST || "127.0.0.1",
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_ADMIN_USER || "root",
  password: process.env.MYSQL_ROOT_PASSWORD || "",
};
let server,
  databaseCreated = false,
  output = "",
  cookie = "",
  csrf = "",
  client,
  settings,
  original;
const config = {
  ...process.env,
  PORT: String(port),
  NODE_ENV: "development",
  APP_ORIGIN: base,
  ADMIN_EMAIL: "test@example.com",
  ADMIN_PASSWORD: password,
  MYSQL_HOST: mysqlAdmin.host,
  MYSQL_PORT: String(mysqlAdmin.port),
  MYSQL_DATABASE: database,
  MYSQL_USER: mysqlAdmin.user,
  MYSQL_PASSWORD: mysqlAdmin.password,
};
async function createTestDatabase() {
  const connection = await createConnection(mysqlAdmin);
  try {
    await connection.query(
      `CREATE DATABASE \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
    databaseCreated = true;
  } finally {
    await connection.end();
  }
}
async function start() {
  server = spawn(process.execPath, ["server/index.mjs"], {
    env: config,
    stdio: ["ignore", "pipe", "pipe"],
  });
  server.stdout.on("data", (b) => (output += b));
  server.stderr.on("data", (b) => (output += b));
  for (let i = 0; i < 100; i++) {
    if (server.exitCode !== null) throw new Error(output);
    try {
      const r = await fetch(base + "/api/health");
      if (r.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error("Startup failed: " + output);
}
async function stop() {
  if (!server || server.exitCode !== null) return;
  server.kill("SIGTERM");
  await new Promise((resolve) => server.once("exit", resolve));
}
async function request(path, method = "GET", body, auth = true, extra = {}) {
  return fetch(base + "/api" + path, {
    method,
    headers: {
      Origin: base,
      "Content-Type": "application/json",
      ...(auth ? { Cookie: cookie, "X-CSRF-Token": csrf } : {}),
      ...extra,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}
async function json(path, method = "GET", body) {
  const r = await request(path, method, body);
  const v = await r.json();
  assert.ok(r.ok, `${method} ${path}: ${r.status} ${JSON.stringify(v)}`);
  return v;
}
before(async () => {
  await createTestDatabase();
  await start();
});
after(async () => {
  await stop();
  if (databaseCreated) {
    const connection = await createConnection(mysqlAdmin);
    try {
      await connection.query(`DROP DATABASE IF EXISTS \`${database}\``);
    } finally {
      await connection.end();
    }
  }
  rmSync(dir, { recursive: true, force: true });
});

test("admin authentication, secure cookie properties, and protected APIs", async () => {
  assert.equal(
    (await request("/invoices", "GET", undefined, false)).status,
    401,
  );
  assert.equal(
    (
      await request(
        "/auth/login",
        "POST",
        { email: "test@example.com", password: "wrong" },
        false,
      )
    ).status,
    401,
  );
  const r = await request(
    "/auth/login",
    "POST",
    { email: "test@example.com", password },
    false,
  );
  assert.equal(r.status, 200);
  const setCookie = r.headers.get("set-cookie");
  assert.match(setCookie, /HttpOnly/);
  assert.match(setCookie, /SameSite=Strict/);
  cookie = setCookie.split(";")[0];
  csrf = (await r.json()).csrf;
  assert.equal(
    (await request("/settings", "PUT", defaults, true, { "X-CSRF-Token": "" }))
      .status,
    403,
  );
  assert.equal(
    (
      await request("/settings", "PUT", defaults, true, {
        Origin: "https://attacker.example",
      })
    ).status,
    403,
  );
  const me = await json("/auth/me");
  assert.equal(me.email, "test@example.com");
});
test("business settings, client and service CRUD", async () => {
  settings = await json("/settings", "PUT", {
    ...defaults,
    business: {
      ...defaults.business,
      name: "TuruDev Test",
      address: "Jakarta",
      email: "team@example.com",
    },
    payment: {
      bank: "BCA",
      accountName: "TuruDev",
      accountNumber: "1234567890",
    },
    tax: 11,
  });
  assert.equal(settings.tax, 11);
  client = await json("/clients", "POST", {
    name: "Sarah Wijaya",
    company: "Acme Studio",
    email: "sarah@example.com",
    phone: "",
    address: "Jakarta",
    taxId: "ABC",
    notes: "",
  });
  const service = await json("/services", "POST", {
    name: "Website Development",
    description: "Website development",
    price: 5000000,
    unit: "project",
  });
  assert.equal(service.price, 5000000);
  await json(`/services/${service.id}`, "PUT", { ...service, price: 6000000 });
  assert.equal((await json("/services"))[0].price, 6000000);
  assert.equal((await request("/clients", "POST", { name: "" })).status, 400);
  assert.equal(
    (await request("/services", "POST", { name: "No price", description: "x" }))
      .status,
    400,
  );
  assert.equal(
    (await request("/settings", "PUT", { ...settings, currency: "BAD" }))
      .status,
    400,
  );
  assert.equal(
    (await request(`/services/${service.id}`, "DELETE")).status,
    204,
  );
});
function invoice(patch = {}) {
  return {
    date: "2026-10-04",
    dueDate: "2026-10-18",
    clientId: client.id,
    client,
    business: settings.business,
    payment: settings.payment,
    currency: "IDR",
    paymentDays: 14,
    status: "Draft",
    items: [
      {
        description: "Website Development",
        quantity: 1,
        unit: "project",
        price: 5000000,
      },
      { description: "Maintenance", quantity: 2, unit: "month", price: 500000 },
    ],
    discountType: "fixed",
    discount: 500000,
    tax: 11,
    notes: "Thank you for your business.",
    ...patch,
  };
}
test("server computes authoritative totals and ignores submitted totals", async () => {
  original = await json("/invoices", "POST", invoice({ totals: { total: 1 } }));
  assert.match(original.number, /^INV-\d{4}-001$/);
  assert.equal(original.totals.subtotal, 6000000);
  assert.equal(original.totals.discount, 500000);
  assert.equal(original.totals.tax, 605000);
  assert.equal(original.totals.total, 6105000);
  assert.equal(
    (
      await request(
        "/invoices",
        "POST",
        invoice({ number: original.number.toLowerCase() }),
      )
    ).status,
    409,
  );
  assert.equal(
    calculate(
      invoice({
        currency: "USD",
        items: [
          { description: "Hour", quantity: 1.5, price: 0.1, unit: "hour" },
        ],
        discountType: "percent",
        discount: 10,
        tax: 11,
      }),
    ).total,
    0.14,
  );
  assert.equal(dueDate("2026-12-31", 14), "2027-01-14");
});
test("invalid invoices are rejected, including dates, item values, and discounts", async () => {
  for (const patch of [
    { clientId: null },
    { clientId: 9999 },
    { date: "2026-02-30" },
    { dueDate: "2026-10-03" },
    { items: [] },
    { items: [{ description: "bad", quantity: 0, price: 1 }] },
    { items: [{ description: "bad", quantity: 1, price: -1 }] },
    { items: [{ description: "fraction", quantity: 1, price: 0.1 }] },
    { discount: 1e8 },
    { discountType: "percent", discount: 101 },
  ]) {
    const r = await request("/invoices", "POST", invoice(patch));
    assert.equal(r.status, 400, JSON.stringify(patch));
  }
  assert.ok(
    invoiceSchema.safeParse(
      invoice({ dueDate: "2026-10-03", confirmEarlyDue: true }),
    ).success,
  );
});
test("concurrent creation receives unique automatically generated numbers", async () => {
  const invoices = await Promise.all(
    Array.from({ length: 8 }, () => json("/invoices", "POST", invoice())),
  );
  assert.equal(new Set(invoices.map((i) => i.number)).size, 8);
});
test("client and settings updates preserve historical invoice snapshots", async () => {
  await json(`/clients/${client.id}`, "PUT", {
    ...client,
    name: "Renamed client",
  });
  await json("/settings", "PUT", {
    ...settings,
    business: { ...settings.business, name: "Renamed business" },
    payment: { bank: "Different bank", accountName: "", accountNumber: "" },
  });
  const saved = await json(`/invoices/${original.id}`);
  assert.equal(saved.client.name, "Sarah Wijaya");
  assert.equal(saved.business.name, "TuruDev Test");
  assert.equal(saved.payment.bank, "BCA");
  const r = await request(`/clients/${client.id}`, "DELETE");
  assert.equal(r.status, 204);
  const edited = await json(`/invoices/${original.id}`, "PUT", {
    ...saved,
    notes: "Updated invoice note",
  });
  assert.equal(edited.notes, "Updated invoice note");
  assert.equal(edited.version, 2);
  original = edited;
  assert.equal(
    (
      await request(`/invoices/${original.id}`, "PUT", {
        ...original,
        version: 1,
      })
    ).status,
    409,
  );
});
test("duplication works after a client is deleted and starts as a fresh draft", async () => {
  const paid = await json(`/invoices/${original.id}/status`, "PATCH", {
    status: "Paid",
    version: original.version,
  });
  original = paid;
  const copy = await json(`/invoices/${original.id}/duplicate`, "POST");
  assert.notEqual(copy.number, original.number);
  assert.equal(copy.status, "Draft");
  assert.equal(copy.client.name, original.client.name);
  assert.equal(copy.payment.bank, "BCA");
  assert.equal(copy.totals.total, original.totals.total);
  assert.equal(copy.dueDate, dueDate(copy.date, 14));
  assert.equal((await request(`/invoices/${copy.id}`, "DELETE")).status, 204);
  assert.equal((await request(`/invoices/${copy.id}`)).status, 404);
});
test("dashboard keeps currencies separate; search and filters work", async () => {
  const newClient = await json("/clients", "POST", { name: "USD Client" });
  await json(
    "/invoices",
    "POST",
    invoice({
      clientId: newClient.id,
      client: newClient,
      currency: "USD",
      items: [
        { description: "Consulting", quantity: 1, price: 100, unit: "hour" },
      ],
      discountType: "percent",
      discount: 0,
      tax: 0,
      status: "Sent",
    }),
  );
  const d = await json("/dashboard");
  assert.equal(d.amounts.USD.outstanding, 100);
  assert.equal(d.amounts.IDR.paid, 6105000);
  assert.equal(d.status.Paid, 1);
  assert.equal((await json("/invoices?status=Paid")).length, 1);
  assert.equal((await json("/invoices?q=Sarah")).length, 9);
  assert.equal((await json("/invoices?from=2027-01-01")).length, 0);
});
test("server-generated PDF contains invoice content and handles multiple pages", async () => {
  const r = await request(`/invoices/${original.id}/pdf`);
  assert.equal(r.status, 200);
  assert.equal(r.headers.get("content-type"), "application/pdf");
  const bytes = Buffer.from(await r.arrayBuffer());
  assert.equal(bytes.subarray(0, 5).toString(), "%PDF-");
  assert.ok(bytes.length > 5000);
  const path = join(dir, "invoice.pdf");
  writeFileSync(path, bytes);
  const parsed = spawnSync("pdftotext", [path, "-"], { encoding: "utf8" });
  if (!parsed.error) {
    assert.equal(parsed.status, 0);
    assert.match(parsed.stdout, /TuruDev Test/);
    assert.match(parsed.stdout, /Sarah Wijaya/);
    assert.match(parsed.stdout, /6,105,000/);
    assert.match(parsed.stdout, /BCA/);
  }
  const many = await json(`/invoices/${original.id}`, "PUT", {
    ...original,
    items: Array.from({ length: 55 }, (_, i) => ({
      description: `Detailed service ${i + 1}: design, implementation, and careful review.`,
      quantity: 1,
      unit: "project",
      price: 50000,
    })),
    discount: 0,
  });
  original = many;
  const longPdf = await request(`/invoices/${many.id}/pdf`);
  assert.equal(longPdf.status, 200);
  writeFileSync(path, Buffer.from(await longPdf.arrayBuffer()));
  const text = spawnSync("pdftotext", [path, "-"], { encoding: "utf8" });
  if (!text.error) {
    assert.equal(text.status, 0);
    assert.match(text.stdout, /Detailed service 55/);
    assert.ok(text.stdout.split("\f").length >= 3);
  }
});
test("non-draft removal archives the invoice and restore brings it back", async () => {
  assert.equal(
    (await request(`/invoices/${original.id}`, "DELETE")).status,
    204,
  );
  assert.ok(!(await json("/invoices")).some((i) => i.id === original.id));
  assert.ok(
    (await json("/invoices?archived=true")).some(
      (i) => i.id === original.id && i.archived,
    ),
  );
  const restored = await json(`/invoices/${original.id}/restore`, "POST");
  assert.equal(restored.archived, false);
});
test("database and authenticated sessions survive a server restart", async () => {
  await stop();
  await start();
  assert.equal(
    (await json(`/invoices/${original.id}`)).number,
    original.number,
  );
  assert.equal((await json("/auth/me")).email, "test@example.com");
});
test("password changes revoke sessions and allow only the new password", async () => {
  assert.equal(
    (
      await request("/auth/password", "PUT", {
        currentPassword: password,
        newPassword: "new-password-for-tests-only",
      })
    ).status,
    204,
  );
  assert.equal((await request("/invoices")).status, 401);
  assert.equal(
    (
      await request(
        "/auth/login",
        "POST",
        { email: "test@example.com", password },
        false,
      )
    ).status,
    401,
  );
  const r = await request(
    "/auth/login",
    "POST",
    { email: "test@example.com", password: "new-password-for-tests-only" },
    false,
  );
  assert.equal(r.status, 200);
  const cookie2 = r.headers.get("set-cookie").split(";")[0];
  const csrf2 = (await r.json()).csrf;
  const logout = await request("/auth/logout", "POST", undefined, true, {
    Cookie: cookie2,
    "X-CSRF-Token": csrf2,
  });
  assert.equal(logout.status, 204);
  assert.equal(
    (await request("/invoices", "GET", undefined, true, { Cookie: cookie2 }))
      .status,
    401,
  );
});

test("operator backup preserves invoice data and refuses to overwrite a backup", async () => {
  const backupPath = join(dir, "snapshot.json");
  const env = { ...config, BACKUP_PATH: backupPath };
  const result = spawnSync(process.execPath, ["scripts/backup.mjs"], {
    env,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
  const backup = JSON.parse(readFileSync(backupPath, "utf8"));
  assert.equal(backup.format, "turudev-mysql-backup-v1");
  assert.equal(
    backup.tables.invoices.find((row) => row.id === original.id).number,
    original.number,
  );
  const repeated = spawnSync(process.execPath, ["scripts/backup.mjs"], {
    env,
    encoding: "utf8",
  });
  assert.notEqual(repeated.status, 0);
  assert.match(repeated.stderr, /Backup already exists/);
});
test("operator password recovery revokes sessions and installs a new password", async () => {
  const previous = "new-password-for-tests-only",
    next = "recovered-password-for-tests-only";
  const login = await request(
    "/auth/login",
    "POST",
    { email: "test@example.com", password: previous },
    false,
  );
  assert.equal(login.status, 200);
  const oldCookie = login.headers.get("set-cookie").split(";")[0];
  const result = spawnSync(process.execPath, ["scripts/reset-admin.mjs"], {
    env: { ...config, ADMIN_PASSWORD: next },
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(
    (await request("/invoices", "GET", undefined, true, { Cookie: oldCookie }))
      .status,
    401,
  );
  assert.equal(
    (
      await request(
        "/auth/login",
        "POST",
        { email: "test@example.com", password: previous },
        false,
      )
    ).status,
    401,
  );
  assert.equal(
    (
      await request(
        "/auth/login",
        "POST",
        { email: "test@example.com", password: next },
        false,
      )
    ).status,
    200,
  );
});
