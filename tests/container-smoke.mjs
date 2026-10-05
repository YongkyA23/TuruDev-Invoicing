import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { randomBytes } from "node:crypto";
const dir = mkdtempSync(join(tmpdir(), "turudev-container-"));
const suffix = randomBytes(5).toString("hex"),
  name = `turudev-smoke-${suffix}`,
  mysqlName = `${name}-mysql`,
  network = `${name}-network`,
  volume = `${name}-mysql-data`;
const image = process.env.DOCKER_IMAGE || "turudev-invoicing:local";
const password = randomBytes(24).toString("base64url");
const mysqlPassword = randomBytes(24).toString("base64url");
const rootPassword = randomBytes(24).toString("base64url");
const config = process.env.DOCKER_CONFIG || resolve(".local/docker");
mkdirSync(config, { recursive: true });
const env = { ...process.env, DOCKER_CONFIG: config };
function docker(...args) {
  const r = spawnSync("docker", args, { env, encoding: "utf8" });
  if (r.status !== 0)
    throw new Error(r.stderr || r.error?.message || "Docker command failed");
  return r.stdout.trim();
}
function mysqlStatus() {
  const r = spawnSync(
    "docker",
    ["inspect", "--format", "{{.State.Health.Status}}", mysqlName],
    { env, encoding: "utf8" },
  );
  return r.status === 0 ? r.stdout.trim() : "starting";
}
writeFileSync(
  join(dir, "config.env"),
  `ADMIN_EMAIL=container@example.com\nADMIN_PASSWORD=${password}\nNODE_ENV=production\nAPP_ORIGIN=https://invoices.example.invalid\nTRUST_PROXY=1\nMYSQL_HOST=${mysqlName}\nMYSQL_PORT=3306\nMYSQL_DATABASE=turudev\nMYSQL_USER=turudev\nMYSQL_PASSWORD=${mysqlPassword}\n`,
  { mode: 0o600 },
);
let networkCreated = false,
  volumeCreated = false,
  mysqlCreated = false,
  appCreated = false;
try {
  docker("network", "create", network);
  networkCreated = true;
  docker("volume", "create", volume);
  volumeCreated = true;
  docker(
    "run",
    "--name",
    mysqlName,
    "--network",
    network,
    "-d",
    "-e",
    `MYSQL_ROOT_PASSWORD=${rootPassword}`,
    "-e",
    "MYSQL_DATABASE=turudev",
    "-e",
    "MYSQL_USER=turudev",
    "-e",
    `MYSQL_PASSWORD=${mysqlPassword}`,
    "--mount",
    `type=volume,source=${volume},target=/var/lib/mysql`,
    "--health-cmd",
    'mysqladmin ping -h 127.0.0.1 -uroot -p"$MYSQL_ROOT_PASSWORD" --silent',
    "--health-interval",
    "1s",
    "--health-timeout",
    "5s",
    "--health-retries",
    "120",
    "mysql:8.4",
  );
  mysqlCreated = true;
  for (let i = 0; i < 120 && mysqlStatus() !== "healthy"; i++)
    await new Promise((r) => setTimeout(r, 1000));
  assert.equal(mysqlStatus(), "healthy", "MySQL failed readiness");

  docker(
    "run",
    "--name",
    name,
    "-d",
    "--network",
    network,
    "--env-file",
    join(dir, "config.env"),
    "-p",
    "127.0.0.1::3000",
    image,
  );
  appCreated = true;
  assert.equal(docker("inspect", "--format", "{{.Config.User}}", name), "node");
  let base;
  async function ready() {
    const port = docker("port", name, "3000/tcp").split(":").at(-1);
    base = `http://127.0.0.1:${port}`;
    for (let i = 0; i < 120; i++) {
      try {
        const r = await fetch(base + "/api/health");
        if (r.ok) return;
      } catch {}
      await new Promise((r) => setTimeout(r, 1000));
    }
    throw new Error("Container failed readiness: " + docker("logs", name));
  }
  await ready();
  let cookie = "",
    csrf = "";
  const origin = "https://invoices.example.invalid";
  async function request(path, method = "GET", body) {
    const r = await fetch(base + "/api" + path, {
      method,
      headers: {
        Origin: origin,
        "Content-Type": "application/json",
        Cookie: cookie,
        "X-CSRF-Token": csrf,
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    assert.ok(r.ok, `${method} ${path} failed (${r.status})`);
    return r;
  }
  const login = await request("/auth/login", "POST", {
    email: "container@example.com",
    password,
  });
  assert.match(login.headers.get("set-cookie"), /Secure/);
  assert.match(login.headers.get("set-cookie"), /HttpOnly/);
  assert.match(login.headers.get("set-cookie"), /SameSite=Strict/);
  cookie = login.headers.get("set-cookie").split(";")[0];
  csrf = (await login.json()).csrf;
  const frontend = await fetch(base + "/");
  assert.equal(frontend.status, 200);
  assert.match(await frontend.text(), /id="root"/);
  const settings = await (await request("/settings")).json();
  const client = await (
    await request("/clients", "POST", { name: "Container Test Client" })
  ).json();
  const invoice = await (
    await request("/invoices", "POST", {
      clientId: client.id,
      client,
      business: settings.business,
      payment: settings.payment,
      currency: "IDR",
      date: "2026-10-04",
      dueDate: "2026-10-18",
      paymentDays: 14,
      status: "Draft",
      items: [
        {
          description: "Production PDF verification",
          quantity: 2,
          unit: "hour",
          price: 100000,
        },
      ],
      discountType: "percent",
      discount: 10,
      tax: 11,
      notes: "Test invoice in an isolated MySQL database.",
    })
  ).json();
  assert.equal(invoice.totals.total, 199800);
  const pdf = await request(`/invoices/${invoice.id}/pdf`);
  const bytes = Buffer.from(await pdf.arrayBuffer());
  assert.equal(bytes.subarray(0, 5).toString(), "%PDF-");
  assert.ok(bytes.length > 5000);
  const pdfPath = join(dir, "invoice.pdf");
  writeFileSync(pdfPath, bytes);
  const extracted = spawnSync("pdftotext", [pdfPath, "-"], {
    encoding: "utf8",
  });
  if (!extracted.error) {
    assert.equal(extracted.status, 0);
    assert.match(extracted.stdout, /Production PDF verification/);
    assert.match(extracted.stdout, /199,800/);
  }
  docker("restart", name);
  await ready();
  assert.equal(
    (await (await request(`/invoices/${invoice.id}`)).json()).number,
    invoice.number,
  );
  const logout = await request("/auth/logout", "POST");
  assert.equal(logout.status, 204);
  const denied = await fetch(base + "/api/invoices", {
    headers: { Cookie: cookie },
  });
  assert.equal(denied.status, 401);
  console.log(
    "Production container passed: non-root process, MySQL, frontend, secure login cookies, server totals, PDF generation, database restart persistence, and logout.",
  );
} catch (error) {
  for (const container of [name, mysqlName])
    if (
      spawnSync("docker", ["inspect", container], { env, stdio: "ignore" })
        .status === 0
    )
      spawnSync("docker", ["logs", container], { env, stdio: "inherit" });
  throw error;
} finally {
  if (appCreated) docker("rm", "-f", name);
  if (mysqlCreated) docker("rm", "-f", mysqlName);
  if (volumeCreated) docker("volume", "rm", volume);
  if (networkCreated) docker("network", "rm", network);
  rmSync(dir, { recursive: true, force: true });
}
