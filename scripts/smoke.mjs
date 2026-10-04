try {
  process.loadEnvFile();
} catch (e) {
  if (e.code !== "ENOENT") throw e;
}
const base =
  process.env.SMOKE_URL || `http://127.0.0.1:${process.env.PORT || 3000}`;
const origin = process.env.APP_ORIGIN || base;
const health = await fetch(base + "/api/health");
if (!health.ok) throw new Error("Health check failed");
const front = await fetch(base + "/");
if (!front.ok || !(await front.text()).includes('id="root"'))
  throw new Error("Built frontend is not being served");
if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD)
  throw new Error(
    "Provide current admin credentials securely for the authenticated smoke check",
  );
const login = await fetch(base + "/api/auth/login", {
  method: "POST",
  headers: { Origin: origin, "Content-Type": "application/json" },
  body: JSON.stringify({
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  }),
});
if (!login.ok)
  throw new Error("Admin smoke login failed; check the current credentials");
const cookie = login.headers.get("set-cookie").split(";")[0];
const { csrf } = await login.json();
try {
  for (const endpoint of [
    "/auth/me",
    "/settings",
    "/clients",
    "/services",
    "/invoices",
    "/dashboard",
  ]) {
    const r = await fetch(base + "/api" + endpoint, {
      headers: { Cookie: cookie },
    });
    if (!r.ok) throw new Error("Protected endpoint failed: " + endpoint);
    await r.json();
  }
} finally {
  await fetch(base + "/api/auth/logout", {
    method: "POST",
    headers: { Cookie: cookie, Origin: origin, "X-CSRF-Token": csrf },
  });
}
console.log(
  "Smoke passed: database, frontend, admin login, protected APIs, and logout.",
);
