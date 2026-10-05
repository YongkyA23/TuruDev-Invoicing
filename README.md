# TuruDev Invoicing

A small team's private invoice workspace, built from the supplied Simple Invoice Generator PRD. React + TypeScript frontend, Express backend, persistent MySQL 8.4 database, single-admin login, and server-side PDFKit invoices. No browser-only database or external PDF service.

## Run locally

Requires **Bun 1.3.11 or newer**, **Node.js 24 or newer**, and Docker Desktop or a local MySQL 8.4 server. Use the existing checkout; cloud tasks are already isolated and do not need a Git worktree.

```sh
bun install --frozen-lockfile
bun run setup:local
docker compose up -d mysql
bun run db:migrate-sqlite # only when upgrading an existing SQLite database
bun run build
bun run start
```

The MySQL container listens only on `127.0.0.1:3306`; the app and API run together on port 3000. Local setup creates or upgrades the ignored `.env`, generates local MySQL credentials, and saves the admin password in `.local/admin-password`. The local email is `admin@turudev.local`. Read the password file locally; do not commit it, paste it into logs, or use the local credentials in production. Existing admin settings are preserved when local setup upgrades an older SQLite configuration.

For frontend hot reload, run `bun run dev` and `bun run dev:web` in separate terminals. Vite proxies `/api` to the backend on port 3000. Set `APP_ORIGIN=http://localhost:5173` in your local `.env` when using Vite through localhost; the login and mutation origin must match the browser origin. Restore `APP_ORIGIN=http://localhost:3000` when serving the built application locally on port 3000. All dates default to Asia/Jakarta.

When upgrading an existing checkout, stop the old server, start MySQL with `docker compose up -d mysql`, then run `bun run db:migrate-sqlite`. The migration preserves IDs, invoice snapshots, admin hash, sessions, settings, clients, and services; it refuses to write into a populated MySQL database and leaves the SQLite source untouched. Start the app only after the migration completes.

## Included workflows

- Dashboard: invoice counts and invoiced, paid, and outstanding amounts, grouped by currency without conversion. Cancelled and archived invoices are excluded from active amounts; unpaid counts include Draft and Sent.
- Invoices: create, view, edit, duplicate, search by invoice/client, filter by status/client/date, and manual Draft/Sent/Paid/Cancelled statuses.
- Single-page editor: inline client creation, saved services, custom items, quantity/price overrides, item removal/reordering, discounts, tax, payment terms, notes, and payment/business overrides.
- Clients and services: create, view/edit, delete, search, and client invoice history.
- Settings: business/logo, bank account, default currency, configurable numbering format, next sequence number, payment terms, tax, notes, and admin password change.
- Preview and PDF: persisted snapshot data, server-calculated totals, embedded fonts, logo, multipage line items, payment details, and notes. PDFs are generated only after saving.
- Deletion: drafts can be deleted; other invoices are archived and can be restored. Removing a client or service preserves historical invoice content.

Automatic numbering is allocated in a database transaction, with a case-insensitive uniqueness constraint. Duplicates receive a new number/date/due date and start as Draft. Concurrent edits use version checks and return a conflict instead of silently overwriting another edit. Client, business, and payment details are copied into each invoice.

Prices are in whole rupiah for IDR and two decimal places for USD/SGD; quantities support four decimal places. Line amounts are rounded to the currency's smallest unit, discounts apply to the subtotal, and percentage tax applies **after discount**. A fixed discount cannot exceed the subtotal. Selecting a service while using a different invoice currency requires adjusting its price manually; there is no currency conversion.

## Validation

```sh
bun run build
bun run test
bun run test:e2e
bun run smoke
```

To verify the production container locally, run `bun run build:docker` followed by `bun run test:container`. This checks a non-root production process, Secure/HttpOnly/SameSite cookies, real MySQL API writes, PDF export, and persistence across an app-container restart using an isolated temporary MySQL container and volume. It removes its test containers and volumes afterward; it does not deploy a public site or modify the development database.

API tests create a uniquely named temporary MySQL database and drop it afterward. They cover authentication, origin/CSRF protection, master-data CRUD, authoritative calculations, invalid data, numbering concurrency, snapshots, edit conflicts, duplication, filtering, dashboard currencies, multipage PDF content, archive/restore, server restart persistence, password rotation, and session revocation. API and browser tests need MySQL admin credentials via `MYSQL_ROOT_PASSWORD`; setup-local provides these for local use. If `pdftotext` is installed, PDF tests also extract and assert text.

Browser tests run against the production frontend build, with an isolated database. They cover the complete desktop invoice workflow, actual PDF download, historical snapshots, mobile navigation/layout, login errors, and unsaved-change confirmation. Run `bun run build` first. Chromium defaults to `/usr/bin/chromium`; override with `CHROMIUM_PATH`, or install Chromium through your platform. Test screenshots and failure traces are saved under ignored `test-results/`.

`bun run smoke` checks the running application, logs in with the configured local bootstrap credentials, reads protected APIs, and logs out. It does not create business records. After changing the admin password in the UI, use the current password through a secure environment binding for this command.

## Deploy

This application needs a **Node.js 24 server and persistent MySQL 8.4 database**. A static-only Sites deployment cannot run its backend, admin sessions, or PDF endpoints. Deploy the entire application on a runtime that supports the server process and provide its MySQL connection settings. Serve the frontend and API from the same HTTPS origin.

The current session has no callable Sites tools, so no public site has been published. The Dockerfile and Compose configuration prepare the full application for a compatible deployment target.

Set these in your hosting provider's secure configuration:

| Variable         | Purpose                                                                                                  |
| ---------------- | -------------------------------------------------------------------------------------------------------- |
| `ADMIN_EMAIL`    | Initial admin email; no default in production.                                                           |
| `ADMIN_PASSWORD` | Strong initial password of at least 12 characters. Required for first startup only; never committed.     |
| `APP_ORIGIN`     | Exact public HTTPS origin, for example `https://invoices.example.com`, without a trailing slash or path. |
| `MYSQL_HOST`     | MySQL hostname, for example the managed database host.                                                   |
| `MYSQL_PORT`     | MySQL port, default `3306`.                                                                              |
| `MYSQL_DATABASE` | Existing database/schema name.                                                                           |
| `MYSQL_USER`     | Application database user with access to `MYSQL_DATABASE`.                                              |
| `MYSQL_PASSWORD` | Application database password, supplied securely.                                                       |
| `PORT`           | HTTP listener, default `3000`.                                                                           |
| `NODE_ENV`       | Set to `production` for HTTPS-only session cookies.                                                      |
| `TRUST_PROXY`    | Set to the exact number of trusted proxy hops (Compose assumes one).                                     |

Changing `ADMIN_PASSWORD` after first initialization does not silently change the stored password. Use Settings → Change admin password, or the admin recovery command below. Session cookies are HttpOnly and SameSite=Strict; production also requires Secure cookies. Login attempts are rate-limited, state-changing requests require matching Origin and CSRF tokens, passwords use salted scrypt hashes, and MySQL stores hashed session tokens. Sessions last 12 hours. Password changes revoke every session.

```sh
docker build -t turudev-invoicing .
docker compose up -d --build
```

Compose runs MySQL 8.4 and the app, binds the app to the host's loopback port 3000, and stores MySQL data and backups in separate named volumes. The database port is published only to loopback for local development. Place a trusted HTTPS reverse proxy in front, forward `X-Forwarded-Proto`, and proxy the whole origin to the app. `/api/health` is the readiness endpoint and checks database connectivity. The app container runs as a non-root user. Build steps use the frozen lockfile.

For builds inside a cloud environment with an injected TLS proxy, use:

```sh
bun run build:docker
```

The helper passes existing proxy configuration through Docker's standard build arguments, resolves the proxy hostname for BuildKit's host mapping, and mounts the platform CA as an optional BuildKit secret. The CA and proxy values are not stored in the final image. TLS and package integrity verification remain enabled. The helper uses the ignored `.local/docker` directory for Docker's writable client configuration unless `DOCKER_CONFIG` is already set.

## Data and recovery

The database contains business information and authentication records. Keep the persistent MySQL volume private and back it up regularly. Use `bun run backup` to create a consistent JSON backup in `data/backups/`, or set `BACKUP_PATH` to an external backup destination. Existing backup destinations are protected from overwrite. In Docker, run `docker compose exec invoices node scripts/backup.mjs`; the backup volume is mounted at `/app/data/backups`. Restore with `bun run restore -- <backup.json>` into an empty MySQL database. Preserve the current database before restoring.

If the admin password is lost, a trusted operator with server filesystem access can set a new strong `ADMIN_PASSWORD` in the secure environment and run `bun run reset:admin`. This updates the password and revokes all sessions. It never prints the password. This is a server-console recovery path, not a public reset endpoint.

Use a private, persistent MySQL database and keep credentials in the host's secret manager. The app creates its tables at startup and serializes invoice number allocation through a transaction. Outbound email, payment gateways, recurring billing, client portals, and accounting features remain outside this release.

## Source layout

`src/` contains the responsive application and typed API client. `server/index.mjs` owns authentication and HTTP routes; `server/domain.mjs` owns validation and calculation; `server/db.mjs` owns MySQL schema/persistence/number allocation; `server/pdf.mjs` renders invoices. `tests/` contains real API and browser workflows against isolated MySQL databases. Embedded PDF fonts retain their license in `server/fonts/LICENSE`.

Styling uses Tailwind CSS through the Vite plugin. Component utility recipes live in the adjacent `*.styles.ts` files; shared recipes live in `src/components/styles.ts`. Theme colors and element defaults live in `src/styles.css`. Responsive, focus, and print variants are included with the component utilities.
