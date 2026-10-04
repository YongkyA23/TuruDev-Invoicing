# Validation and deployment handoff

Validated in the cloud workspace on 4 October 2026. The project implements the supplied PRD plus the requested backend, admin login, and server-side PDF generation.

| Check                                          | Observed result                                                                                                                                                                       |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frozen installation and repeatable local setup | `npm ci --cache /workspace/.npm-cache` passed; repeated `npm run setup:local` preserved existing configuration.                                                                       |
| Production frontend build and TypeScript       | `npm run build` passed.                                                                                                                                                               |
| Backend and operator workflows                 | `npm test`: **14 passed, 0 failed, 0 skipped**.                                                                                                                                       |
| Browser workflows                              | `npm run test:e2e`: **2 passed, 0 failed**; desktop, mobile, and tablet widths exercised. Actual PDF downloaded and checked.                                                          |
| Runtime smoke                                  | `npm run smoke` passed: health/database, built frontend, login, all protected read APIs, logout.                                                                                      |
| Docker build                                   | `npm run build:docker` passed with TLS/integrity checks enabled.                                                                                                                      |
| Production container                           | `npm run test:container` passed: non-root process, production cookies, invoice writes/calculations, readable server-generated PDF, persistent data and session after restart, logout. |
| Database backup                                | SQLite `integrity_check` returned `ok`; operator tests verified invoice data and protection against overwriting backups.                                                              |
| Production dependency audit                    | `npm audit --omit=dev`: 0 reported vulnerabilities at validation time.                                                                                                                |
| Repository hygiene                             | `git diff --check` passed; `.env`, local credentials/configuration, databases, backups, generated assets, and test outputs are ignored.                                               |

The backend tests also verify origin and CSRF enforcement, invalid inputs, case-insensitive invoice uniqueness, concurrent automatic numbering, immutable historical master-data snapshots, edit version conflicts, duplication after client deletion, per-currency dashboard amounts, search/filtering, draft deletion, archive/restore, multipage PDF text, password rotation, and operator password recovery with session revocation.

Docker troubleshooting identified BuildKit DNS resolution for the configured egress proxy. The build helper resolves that hostname for Docker's build-time host mapping and mounts the platform's trusted CA temporarily. Verification was never disabled. The production container also verifies that source permissions allow the non-root process to read application files while only the data directory needs write access.

## Saved and available

- Complete frontend/backend source, frozen dependency lockfile, tests, CI workflow, Dockerfile, Compose configuration, and operator utilities are in this checkout.
- The source PRD is retained in `docs/PRODUCT_REQUIREMENTS.md`.
- Cloud environment `install_script` and `start_skill` are saved in the environment configuration draft. Saving that draft does not publish it or deploy the application. Review and save it in environment settings, then publish the prepared environment if desired.
- The application was validated in this instance and a local production container. Restoration in a fresh cloud task has not been independently tested.
- GitHub CI is configured to run on pushes and pull requests. The local results above do not establish remote CI success; check the repository's Actions page for that result.

## Deployment blocker

No callable Sites connector or tool-search capability is available in this session, including after checking again at the deployment stage. No public website or deployment URL was created.

To publish the full application, enable the requested Sites deployment tools and provide a target that supports a Node.js 24 server with persistent storage. If the selected Sites offering supports only static files, a compatible backend host and a same-origin API proxy are required. Configure the public HTTPS origin and initial admin credentials securely in the hosting settings, following README.md; never put passwords in chat or source control.

This is a single-instance SQLite application for a small internal team. Deployment must preserve the database volume and terminate HTTPS through a trusted proxy. It is ready for deployment review, but publication, public HTTPS operation, and fresh-task restoration have not been claimed or verified.
