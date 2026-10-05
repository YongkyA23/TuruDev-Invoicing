# syntax=docker/dockerfile:1
FROM oven/bun:1.3.11 AS bun
FROM node:24-bookworm-slim AS tooling
COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun
WORKDIR /app
FROM tooling AS build
COPY package.json bun.lock ./
RUN --mount=type=secret,id=proxy_ca \
    export NODE_USE_ENV_PROXY=1; \
    if [ -f /run/secrets/proxy_ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/proxy_ca; fi; \
    bun install --frozen-lockfile
COPY index.html vite.config.ts tsconfig.json ./
COPY src ./src
COPY public ./public
RUN bun run build

FROM tooling AS production-dependencies
COPY package.json bun.lock ./
RUN --mount=type=secret,id=proxy_ca \
    export NODE_USE_ENV_PROXY=1; \
    if [ -f /run/secrets/proxy_ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/proxy_ca; fi; \
    bun install --production --frozen-lockfile

FROM node:24-bookworm-slim AS runtime
ENV NODE_ENV=production PORT=3000
WORKDIR /app
COPY package.json bun.lock ./
COPY --from=production-dependencies /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY server ./server
COPY scripts/backup.mjs scripts/reset-admin.mjs scripts/restore.mjs scripts/smoke.mjs ./scripts/
RUN chmod -R a+rX /app/server /app/scripts /app/dist \
    && chmod a+r /app/package.json /app/bun.lock \
    && mkdir -p /app/data/backups && chown -R node:node /app/data
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server/index.mjs"]
