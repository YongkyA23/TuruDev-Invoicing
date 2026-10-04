import { spawn } from "node:child_process";
import { lookup } from "node:dns/promises";
import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
// Cloud BuildKit needs a resolvable proxy hostname and the platform's trusted CA.
// Values stay in process configuration; proxy credentials are never logged or baked into the image.
const args = ["build"];
const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
if (proxy) {
  const host = new URL(proxy).hostname;
  const { address } = await lookup(host, { family: 4 });
  args.push(
    "--network=host",
    "--add-host",
    `${host}:${address}`,
    "--build-arg",
    "HTTPS_PROXY",
    "--build-arg",
    "HTTP_PROXY",
    "--build-arg",
    "NO_PROXY",
  );
}
const ca = process.env.NODE_EXTRA_CA_CERTS;
if (ca) {
  if (!existsSync(ca))
    throw new Error("The configured trust certificate is missing");
  args.push("--secret", `id=proxy_ca,src=${ca}`);
}
args.push("-t", process.env.DOCKER_IMAGE || "turudev-invoicing:local", ".");
const config = process.env.DOCKER_CONFIG || resolve(".local/docker");
mkdirSync(config, { recursive: true });
const child = spawn("docker", args, {
  stdio: "inherit",
  env: {
    ...process.env,
    DOCKER_CONFIG: config,
    ...(proxy ? { HTTPS_PROXY: proxy } : {}),
  },
});
child.on("error", (e) => {
  console.error("Could not launch Docker:", e.message);
  process.exitCode = 1;
});
child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
