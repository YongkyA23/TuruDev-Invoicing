#!/usr/bin/env bash
set -euo pipefail

source_db=/home/turudev-runner/invoices.sqlite
marker=/var/lib/turudev-invoicing/.sqlite-migrated

if [[ -e "$marker" ]]; then
    exit 0
fi
if [[ ! -f "$source_db" ]]; then
    exit 0
fi

set -a
. /etc/turudev-invoicing/production.env
set +a
export SQLITE_MIGRATION_PATH="$source_db"

runuser --preserve-environment --user turudev-app -- \
    /usr/local/bin/node24 \
    /var/www/turudev-invoicing/current/scripts/migrate-sqlite-to-mysql.mjs

install -m 0600 /dev/null "$marker"
rm "$source_db"
