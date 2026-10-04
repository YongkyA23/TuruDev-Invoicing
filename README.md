# TuruDev Invoicing

A small team's private invoice workspace, built from the supplied Simple Invoice Generator PRD. React + TypeScript frontend, Express backend, persistent SQLite database, single-admin login, and server-side PDFKit invoices. No browser-only database or external PDF service.

## Run locally

Requires **Node.js 24 or newer**. Use the existing checkout; cloud tasks are already isolated and do not need a Git worktree.

```sh
npm ci --cache /workspace/.npm-cache
npm run setup:local
npm run build
npm start
```

The app and API run together on port 3000. Local setup creates an ignored `.env` and a random admin password in `.local/admin-password`, both with owner-only permissions. The local email is `admin@turudev.local`. Read the password file locally; do not commit it, paste it into logs, or use the local credentials in production. Running local setup again preserves an existing `.env`.

For frontend hot reload, run `npm run dev` and `npm run dev:web` in separate terminals. Vite proxies `/api` to the backend on port 3000. Set `APP_ORIGIN=http://localhost:5173` in your local `.env` when using Vite through localhost; the login and mutation origin must match the browser origin. Remove that override when serving the built application locally on port 3000. All dates default to Asia/Jakarta.

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
npm run build
npm test
npm run test:e2e
npm run smoke
```

To verify the production container locally, run `npm run build:docker` followed by `npm run test:container`. This checks a non-root production process, Secure/HttpOnly/SameSite cookies, real API writes, PDF export, and persistence across a container restart using a temporary volume and generated test credentials. It removes its test container and volume afterward; it does not deploy a public site or modify the development database.

API tests run a real server against a temporary database. They cover authentication, origin/CSRF protection, master-data CRUD, authoritative calculations, invalid data, numbering concurrency, snapshots, edit conflicts, duplication, filtering, dashboard currencies, multipage PDF content, archive/restore, server restart persistence, password rotation, and session revocation. If `pdftotext` is installed, PDF tests also extract and assert text.

Browser tests run against the production frontend build, with an isolated database. They cover the complete desktop invoice workflow, actual PDF download, historical snapshots, mobile navigation/layout, login errors, and unsaved-change confirmation. Run `npm run build` first. Chromium defaults to `/usr/bin/chromium`; override with `CHROMIUM_PATH`, or install Chromium through your platform. Test screenshots and failure traces are saved under ignored `test-results/`.

`npm run smoke` checks the running application, logs in with the configured local bootstrap credentials, reads protected APIs, and logs out. It does not create business records. After changing the admin password in the UI, use the current password through a secure environment binding for this command.

## Deploy

This application needs a **Node.js 24 server and persistent storage**. A static-only Sites deployment cannot run its backend, admin sessions, or PDF endpoints. Deploy the entire application on a runtime that supports the server process and mount persistent storage at `DATABASE_PATH`. Serve the frontend and API from the same HTTPS origin.

The current session has no callable Sites tools, so no public site has been published. The Dockerfile and Compose configuration prepare the full application for a compatible deployment target.

Set these in your hosting provider's secure configuration:

| Variable         | Purpose                                                                                                  |
| ---------------- | -------------------------------------------------------------------------------------------------------- |
| `ADMIN_EMAIL`    | Initial admin email; no default in production.                                                           |
| `ADMIN_PASSWORD` | Strong initial password of at least 12 characters. Required for first startup only; never committed.     |
| `APP_ORIGIN`     | Exact public HTTPS origin, for example `https://invoices.example.com`, without a trailing slash or path. |
| `DATABASE_PATH`  | Persistent SQLite file, default `./data/invoices.sqlite`.                                                |
| `PORT`           | HTTP listener, default `3000`.                                                                           |
| `NODE_ENV`       | Set to `production` for HTTPS-only session cookies.                                                      |
| `TRUST_PROXY`    | Set to the exact number of trusted proxy hops (Compose assumes one).                                     |

Changing `ADMIN_PASSWORD` after first initialization does not silently change the stored password. Use Settings → Change admin password, or the admin recovery command below. Session cookies are HttpOnly and SameSite=Strict; production also requires Secure cookies. Login attempts are rate-limited, state-changing requests require matching Origin and CSRF tokens, passwords use salted scrypt hashes, and SQLite stores hashed session tokens. Sessions last 12 hours. Password changes revoke every session.

```sh
docker build -t turudev-invoicing .
docker compose up -d --build
```

Compose binds the app to the host's loopback port 3000 and stores data in a named `invoices-data` volume. Place a trusted HTTPS reverse proxy in front, forward `X-Forwarded-Proto`, and proxy the whole origin to the app. `/api/health` is the readiness endpoint and checks database connectivity. The container runs as a non-root user. Build steps use the frozen lockfile.

For builds inside a cloud environment with an injected TLS proxy, use:

```sh
npm run build:docker
```

The helper passes existing proxy configuration through Docker's standard build arguments, resolves the proxy hostname for BuildKit's host mapping, and mounts the platform CA as an optional BuildKit secret. The CA and proxy values are not stored in the final image. TLS and package integrity verification remain enabled. The helper uses the ignored `.local/docker` directory for Docker's writable client configuration unless `DOCKER_CONFIG` is already set.

## Data and recovery

The database contains business information and authentication records. Keep the persistent volume private and back it up regularly. Use `npm run backup` to create a consistent SQLite backup in `data/backups/`, or set `BACKUP_PATH` to an external backup destination. Existing backup destinations are protected from overwrite. In Docker, run `docker compose exec invoices npm run backup` and copy the result to your backup storage. The live database uses WAL mode; copying only the `.sqlite` file while the server is running can miss recent writes. Restore a verified backup with the server stopped and preserve any current database before replacing it.

If the admin password is lost, a trusted operator with server filesystem access can set a new strong `ADMIN_PASSWORD` in the secure environment and run `npm run reset:admin`. This updates the password and revokes all sessions. It never prints the password. This is a server-console recovery path, not a public reset endpoint.

SQLite is suited to the small internal team in the PRD. Run one instance against a local persistent volume; do not place the database on ephemeral storage or share it between independent replicas/network filesystems. Horizontal scaling would require a database change. Outbound email, payment gateways, recurring billing, client portals, and accounting features remain outside this release.

## Source layout

`src/` contains the responsive application and typed API client. `server/index.mjs` owns authentication and HTTP routes; `server/domain.mjs` owns validation and calculation; `server/db.mjs` owns schema/persistence/number allocation; `server/pdf.mjs` renders invoices. `tests/` contains real API and browser workflows. Embedded PDF fonts retain their license in `server/fonts/LICENSE`.
