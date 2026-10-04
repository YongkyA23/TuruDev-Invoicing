import express from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import cookieParser from "cookie-parser";
import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
try {
  process.loadEnvFile();
} catch (e) {
  if (e.code !== "ENOENT") throw e;
}
const {
  db,
  getSettings,
  putSettings,
  fromRow,
  getInvoice,
  transaction,
  reserveNumber,
} = await import("./db.mjs");
const {
  clientSchema,
  serviceSchema,
  settingsSchema,
  invoiceSchema,
  calculate,
  today,
  dueDate,
} = await import("./domain.mjs");
const { createPdf } = await import("./pdf.mjs");
const production = process.env.NODE_ENV === "production";
if (production && !process.env.APP_ORIGIN)
  throw new Error("APP_ORIGIN is required in production");
if (process.env.APP_ORIGIN) {
  const origin = new URL(process.env.APP_ORIGIN);
  if (
    origin.origin !== process.env.APP_ORIGIN ||
    (production && origin.protocol !== "https:")
  )
    throw new Error(
      "APP_ORIGIN must be an exact origin; production requires HTTPS",
    );
}
const hashPassword = (password) => {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
};
const verifyPassword = (password, stored) => {
  const [salt, hash] = stored.split(":");
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
};
const seedPassword = process.env.ADMIN_PASSWORD;
if (!db.prepare("SELECT id FROM admin WHERE id=1").get()) {
  if (
    !process.env.ADMIN_EMAIL ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(process.env.ADMIN_EMAIL) ||
    !seedPassword ||
    seedPassword.length < 12 ||
    seedPassword.length > 500
  )
    throw new Error(
      "First startup requires ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters. Use npm run setup:local for development.",
    );
  db.prepare("INSERT INTO admin (id,email,hash) VALUES (1,?,?)").run(
    process.env.ADMIN_EMAIL.toLowerCase(),
    hashPassword(seedPassword),
  );
}
const app = express();
if (process.env.TRUST_PROXY)
  app.set("trust proxy", Number(process.env.TRUST_PROXY));
app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        fontSrc: ["'self'"],
        connectSrc: ["'self'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: production ? [] : null,
      },
    },
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.get("/api/health", (req, res) => {
  db.prepare("SELECT 1").get();
  res.json({ status: "ok" });
});
app.use("/api", (req, res, next) => {
  res.set("Cache-Control", "no-store");
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    const expected =
      process.env.APP_ORIGIN || `${req.protocol}://${req.get("host")}`;
    if (req.get("origin") !== expected)
      return res.status(403).json({ error: "Request origin is not allowed" });
  }
  next();
});
const loginLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many login attempts. Try again in 15 minutes." },
});
const tokenHash = (token) => createHash("sha256").update(token).digest("hex");
app.post("/api/auth/login", loginLimit, (req, res) => {
  const { email, password } = req.body || {};
  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    password.length > 500
  )
    return res.status(400).json({ error: "Email and password are required" });
  const admin = db.prepare("SELECT * FROM admin WHERE id=1").get();
  const valid = verifyPassword(password, admin.hash);
  if (!valid || email.toLowerCase() !== admin.email)
    return res.status(401).json({ error: "Incorrect email or password" });
  db.prepare("DELETE FROM sessions WHERE expires<?").run(Date.now());
  const token = randomBytes(32).toString("hex"),
    csrf = randomBytes(32).toString("hex");
  db.prepare("INSERT INTO sessions (token,csrf,expires) VALUES (?,?,?)").run(
    tokenHash(token),
    csrf,
    Date.now() + 12 * 60 * 60 * 1000,
  );
  res.cookie("session", token, {
    httpOnly: true,
    secure: production,
    sameSite: "strict",
    maxAge: 12 * 60 * 60 * 1000,
    path: "/",
  });
  res.json({ email: admin.email, csrf });
});
app.use("/api", (req, res, next) => {
  const token = req.cookies.session;
  const session =
    typeof token === "string" &&
    db
      .prepare("SELECT * FROM sessions WHERE token=? AND expires>?")
      .get(tokenHash(token), Date.now());
  if (!session) return res.status(401).json({ error: "Please sign in" });
  req.session = session;
  if (
    !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
    req.get("x-csrf-token") !== session.csrf
  )
    return res
      .status(403)
      .json({ error: "Invalid security token. Refresh and try again." });
  next();
});
app.get("/api/auth/me", (req, res) =>
  res.json({
    email: db.prepare("SELECT email FROM admin WHERE id=1").get().email,
    csrf: req.session.csrf,
  }),
);
app.post("/api/auth/logout", (req, res) => {
  db.prepare("DELETE FROM sessions WHERE token=?").run(req.session.token);
  res.clearCookie("session", {
    path: "/",
    httpOnly: true,
    secure: production,
    sameSite: "strict",
  });
  res.sendStatus(204);
});
app.put("/api/auth/password", (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  const admin = db.prepare("SELECT * FROM admin WHERE id=1").get();
  if (
    typeof currentPassword !== "string" ||
    currentPassword.length > 500 ||
    !verifyPassword(currentPassword, admin.hash)
  )
    return res.status(400).json({ error: "Current password is incorrect" });
  if (
    typeof newPassword !== "string" ||
    newPassword.length < 12 ||
    newPassword.length > 500
  )
    return res
      .status(400)
      .json({ error: "New password must have 12–500 characters" });
  transaction(() => {
    db.prepare("UPDATE admin SET hash=? WHERE id=1").run(
      hashPassword(newPassword),
    );
    db.prepare("DELETE FROM sessions").run();
  });
  res.clearCookie("session", { path: "/" });
  res.sendStatus(204);
});
app.get("/api/settings", (req, res) => res.json(getSettings()));
app.put("/api/settings", (req, res) => {
  const v = settingsSchema.parse(req.body);
  putSettings(v);
  res.json(v);
});
for (const [table, schema] of [
  ["clients", clientSchema],
  ["services", serviceSchema],
]) {
  app.get(`/api/${table}`, (req, res) =>
    res.json(
      db.prepare(`SELECT * FROM ${table} ORDER BY id DESC`).all().map(fromRow),
    ),
  );
  app.post(`/api/${table}`, (req, res) => {
    const data = schema.parse(req.body);
    const r = db
      .prepare(`INSERT INTO ${table} (data) VALUES (?)`)
      .run(JSON.stringify(data));
    res.status(201).json({ ...data, id: Number(r.lastInsertRowid) });
  });
  app.put(`/api/${table}/:id`, (req, res) => {
    const data = schema.parse(req.body);
    const r = db
      .prepare(`UPDATE ${table} SET data=? WHERE id=?`)
      .run(JSON.stringify(data), req.params.id);
    if (!r.changes) return res.status(404).json({ error: "Record not found" });
    res.json({ ...data, id: Number(req.params.id) });
  });
  app.delete(`/api/${table}/:id`, (req, res) => {
    const r = db.prepare(`DELETE FROM ${table} WHERE id=?`).run(req.params.id);
    if (!r.changes) return res.status(404).json({ error: "Record not found" });
    res.sendStatus(204);
  });
}
app.get("/api/invoices", (req, res) => {
  let invoices = db
    .prepare("SELECT * FROM invoices ORDER BY updated_at DESC,id DESC")
    .all()
    .map(fromRow);
  if (req.query.archived !== "true")
    invoices = invoices.filter((i) => !i.archived);
  if (req.query.q) {
    const q = String(req.query.q).toLowerCase();
    invoices = invoices.filter(
      (i) =>
        i.number.toLowerCase().includes(q) ||
        i.client.name.toLowerCase().includes(q) ||
        i.client.company.toLowerCase().includes(q),
    );
  }
  if (req.query.status)
    invoices = invoices.filter((i) => i.status === req.query.status);
  if (req.query.clientId)
    invoices = invoices.filter(
      (i) => i.clientId === Number(req.query.clientId),
    );
  if (req.query.from)
    invoices = invoices.filter((i) => i.date >= String(req.query.from));
  if (req.query.to)
    invoices = invoices.filter((i) => i.date <= String(req.query.to));
  res.json(invoices);
});
app.get("/api/dashboard", (req, res) => {
  const list = db
    .prepare(
      "SELECT * FROM invoices WHERE archived=0 ORDER BY updated_at DESC,id DESC",
    )
    .all()
    .map(fromRow);
  const status = Object.fromEntries(
    ["Draft", "Sent", "Paid", "Cancelled"].map((s) => [
      s,
      list.filter((i) => i.status === s).length,
    ]),
  );
  const amounts = {};
  for (const i of list) {
    if (i.status === "Cancelled") continue;
    amounts[i.currency] ||= { invoiced: 0, paid: 0, outstanding: 0 };
    amounts[i.currency].invoiced += i.totals.total;
    if (i.status === "Paid") amounts[i.currency].paid += i.totals.total;
    if (i.status === "Sent") amounts[i.currency].outstanding += i.totals.total;
  }
  res.json({
    total: list.length,
    status,
    unpaid: status.Draft + status.Sent,
    amounts,
    recent: list.slice(0, 6),
  });
});
function checkClient(data) {
  if (
    data.clientId === null ||
    !db.prepare("SELECT id FROM clients WHERE id=?").get(data.clientId)
  ) {
    const e = new Error("Select a saved client");
    e.status = 400;
    throw e;
  }
}
function writeInvoice(input) {
  const data = invoiceSchema.parse(input);
  checkClient(data);
  const totals = calculate(data);
  return transaction(() => {
    const number = data.number || reserveNumber();
    const timestamp = new Date().toISOString();
    const r = db
      .prepare(
        "INSERT INTO invoices (number,data,created_at,updated_at) VALUES (?,?,?,?)",
      )
      .run(
        number,
        JSON.stringify({ ...data, number, totals }),
        timestamp,
        timestamp,
      );
    return getInvoice(Number(r.lastInsertRowid));
  });
}
app.post("/api/invoices", (req, res) =>
  res.status(201).json(writeInvoice(req.body)),
);
app.get("/api/invoices/:id", (req, res) => {
  const i = getInvoice(req.params.id);
  if (!i) return res.status(404).json({ error: "Invoice not found" });
  res.json(i);
});
app.put("/api/invoices/:id", (req, res) => {
  const existing = getInvoice(req.params.id);
  if (!existing) return res.status(404).json({ error: "Invoice not found" });
  const data = invoiceSchema.parse(req.body);
  if (!data.number)
    return res.status(400).json({ error: "Invoice number cannot be empty" });
  // Historical snapshots remain editable even if their original client was deleted.
  if (data.clientId !== existing.clientId) checkClient(data);
  const totals = calculate(data);
  const r = db
    .prepare(
      "UPDATE invoices SET number=?,data=?,version=version+1,updated_at=? WHERE id=? AND version=?",
    )
    .run(
      data.number,
      JSON.stringify({ ...data, totals }),
      new Date().toISOString(),
      req.params.id,
      req.body.version,
    );
  if (!r.changes)
    return res.status(409).json({
      error: "This invoice changed in another window. Reload before saving.",
    });
  res.json(getInvoice(req.params.id));
});
app.patch("/api/invoices/:id/status", (req, res) => {
  const i = getInvoice(req.params.id);
  if (!i) return res.status(404).json({ error: "Invoice not found" });
  if (!["Draft", "Sent", "Paid", "Cancelled"].includes(req.body.status))
    return res.status(400).json({ error: "Invalid status" });
  if (req.body.version !== i.version)
    return res
      .status(409)
      .json({ error: "This invoice changed. Reload before changing status." });
  i.status = req.body.status;
  db.prepare(
    "UPDATE invoices SET data=?,version=version+1,updated_at=? WHERE id=?",
  ).run(JSON.stringify(i), new Date().toISOString(), i.id);
  res.json(getInvoice(i.id));
});
app.post("/api/invoices/:id/duplicate", (req, res) => {
  const i = getInvoice(req.params.id);
  if (!i) return res.status(404).json({ error: "Invoice not found" });
  const data = invoiceSchema.parse({
    ...i,
    number: undefined,
    date: today(),
    dueDate: dueDate(today(), i.paymentDays),
    confirmEarlyDue: false,
    status: "Draft",
  });
  const copy = transaction(() => {
    const number = reserveNumber(),
      timestamp = new Date().toISOString();
    const r = db
      .prepare(
        "INSERT INTO invoices (number,data,created_at,updated_at) VALUES (?,?,?,?)",
      )
      .run(
        number,
        JSON.stringify({ ...data, number, totals: calculate(data) }),
        timestamp,
        timestamp,
      );
    return getInvoice(Number(r.lastInsertRowid));
  });
  res.status(201).json(copy);
});
app.delete("/api/invoices/:id", (req, res) => {
  const i = getInvoice(req.params.id);
  if (!i) return res.status(404).json({ error: "Invoice not found" });
  if (i.status === "Draft")
    db.prepare("DELETE FROM invoices WHERE id=?").run(i.id);
  else
    db.prepare(
      "UPDATE invoices SET archived=1,version=version+1,updated_at=? WHERE id=?",
    ).run(new Date().toISOString(), i.id);
  res.sendStatus(204);
});
app.post("/api/invoices/:id/restore", (req, res) => {
  const i = getInvoice(req.params.id);
  if (!i) return res.status(404).json({ error: "Invoice not found" });
  db.prepare(
    "UPDATE invoices SET archived=0,version=version+1,updated_at=? WHERE id=?",
  ).run(new Date().toISOString(), i.id);
  res.json(getInvoice(i.id));
});
app.get("/api/invoices/:id/pdf", (req, res) => {
  const invoice = getInvoice(req.params.id);
  if (!invoice) return res.status(404).json({ error: "Invoice not found" });
  res
    .type("application/pdf")
    .set(
      "Content-Disposition",
      `attachment; filename="${invoice.number.replace(/[^A-Za-z0-9_-]/g, "_")}.pdf"`,
    );
  createPdf(invoice, res);
});
app.use("/api", (req, res) =>
  res.status(404).json({ error: "Endpoint not found" }),
);
const dist = resolve("dist");
if (existsSync(dist)) {
  app.use(express.static(dist, { index: false }));
  app.get("/{*path}", (req, res) => res.sendFile(resolve(dist, "index.html")));
}
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (err.name === "ZodError")
    return res.status(400).json({
      error: err.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; "),
    });
  if (
    err.code?.includes("SQLITE_CONSTRAINT") ||
    err.message?.includes("UNIQUE constraint")
  )
    return res
      .status(409)
      .json({ error: "This invoice number is already in use" });
  if (err.type === "entity.too.large")
    return res.status(413).json({ error: "The uploaded data is too large" });
  if (err instanceof SyntaxError && err.status === 400)
    return res.status(400).json({ error: "Invalid JSON" });
  if (err.status) return res.status(err.status).json({ error: err.message });
  if (
    ["Invoice amount is too large", "Discount cannot exceed subtotal"].includes(
      err.message,
    )
  )
    return res.status(400).json({ error: err.message });
  console.error("Request failed:", err.message);
  res.status(500).json({ error: "An unexpected error occurred" });
});
const server = app.listen(Number(process.env.PORT || 3000), "0.0.0.0", () =>
  console.log(`TuruDev server listening on port ${process.env.PORT || 3000}`),
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () =>
    server.close(() => {
      db.close();
      process.exit(0);
    }),
  );
