#!/usr/bin/env bash
set -euo pipefail
# Supabase direct host (:5432) is often unreachable from GitHub-hosted runners.
# DATABASE_URL for Prisma should use the Transaction pooler (6543, pgbouncer=true).
# See docs/DEPLOYMENT.md.

url="${DATABASE_URL:-}"
if [[ -z "$url" ]]; then
  echo '::error::DATABASE_URL is not set. Add the DATABASE_URL repository secret.'
  exit 1
fi

if [[ "$url" == *db.*.supabase.co:5432* ]]; then
  echo '::error::DATABASE_URL points at Supabase direct Postgres (db.*.supabase.co:5432). GitHub Actions usually cannot reach it. In Supabase → Project Settings → Database → Connection string, copy the **Transaction pooler** URI for Prisma `DATABASE_URL` (port 6543, includes pgbouncer=true) and the **Session** or direct URI for `DIRECT_URL`. See docs/DEPLOYMENT.md.'
  exit 1
fi
