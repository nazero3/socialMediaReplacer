# Deployment

This guide deploys the four services and the mobile app:

1. **Postgres + Redis** — managed (Fly.io, Railway, Neon, Upstash, etc.).
2. **API** — Fastify on Fly.io / Railway.
3. **Worker** — BullMQ on Fly.io / Railway, separate process.
4. **Web** — Next.js on Vercel.
5. **Mobile** — Expo EAS preview build.

## 0) “No-card” option: GitHub Actions instead of a 24/7 worker

If you do not want a paid/always-on worker host (Render/Fly/Railway), you can still run ingestion + digest on a schedule using **GitHub Actions**.

This repo includes:

- `.github/workflows/scheduled-ingest.yml` — runs `pnpm --filter @smr/worker ingest:once` every 6 hours
- `.github/workflows/scheduled-digest.yml` — runs `pnpm --filter @smr/worker digest:once` daily

### Required GitHub repository secrets

Create these in GitHub → **Settings → Secrets and variables → Actions → New repository secret**:

- `DATABASE_URL` — Supabase Postgres URI
- `REDDIT_USER_AGENT` — descriptive string (not secret, but stored as a secret is fine)

Optional (recommended):

- `INGEST_LIMIT_PER_SOURCE` — e.g. `20` (if omitted, worker default applies)
- `LLM_PROVIDER` — e.g. `openai` or `template`
- `OPENAI_API_KEY` — only if you want LLM digests
- `OPENAI_MODEL` — e.g. `gpt-4o-mini`

### Notes

- GitHub Actions cron is **best-effort** (can be delayed a few minutes). That is fine for a reader digest product.
- You still need **Redis** if you use the API admin endpoint that enqueues BullMQ jobs, but the scheduled ingest/digest scripts **do not require Redis**.

## 1. Provision data services
- **Postgres 16**: any managed provider. Capture `DATABASE_URL`.
- **Redis 7**: any managed provider. Capture `REDIS_URL`. Make sure it accepts BullMQ's blocking commands (no eviction policy on keys with TTL set by BullMQ).

## 2. API and Worker (Fly.io recipe)

```bash
# From the repo root
fly launch --no-deploy --copy-config --name smr-api  # creates fly.toml for API
fly launch --no-deploy --copy-config --name smr-worker
fly secrets set -a smr-api \
  DATABASE_URL=$DATABASE_URL \
  REDIS_URL=$REDIS_URL \
  ADMIN_TOKEN=$ADMIN_TOKEN
fly secrets set -a smr-worker \
  DATABASE_URL=$DATABASE_URL \
  REDIS_URL=$REDIS_URL \
  REDDIT_USER_AGENT='socialMediaReplacer/0.1 (+https://yourdomain)' \
  OPENAI_API_KEY=$OPENAI_API_KEY \
  OPENAI_MODEL=gpt-4o-mini \
  INGEST_CRON='0 */6 * * *' \
  DIGEST_CRON='0 6 * * *'
```

A minimal `Dockerfile` (one per app, or a multi-stage shared image) should:

```Dockerfile
FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/api ./apps/api
COPY apps/worker ./apps/worker
COPY packages ./packages
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @smr/api... build
EXPOSE 4000
CMD ["pnpm", "--filter", "@smr/api", "start"]
```

(For the worker image, swap the final `CMD` to `pnpm --filter @smr/worker start`.)

## 3. Web (Vercel)

- Project root: `apps/web`.
- Install command: `pnpm install`.
- Build command: `pnpm --filter @smr/web... build`.
- Output: `.next` (default).
- Environment variables:
  - `NEXT_PUBLIC_API_URL=https://api.yourdomain`
  - `NEXT_PUBLIC_SITE_URL=https://www.yourdomain`

## 4. Mobile (Expo EAS)

```bash
pnpm --filter @smr/mobile add -g eas-cli
cd apps/mobile
eas init
eas build --profile preview --platform all
```

Set `apiUrl` in `app.json -> extra.apiUrl` to your deployed API URL before building.

## 5. Health checks
- `GET https://api.yourdomain/healthz` returns `{ ok: true }`.
- `GET https://api.yourdomain/feed.xml` returns valid Atom.
- Worker logs: `Ingest jobs every 6h, Digest job daily 06:00 UTC`.

## 6. Operational notes
- The admin endpoints (`/admin/*`) require `Authorization: Bearer $ADMIN_TOKEN`. Use timing-safe comparison.
- Per Reddit's API ToS, set a descriptive `REDDIT_USER_AGENT` like `appname/version (+contact-url)`.
- If the LLM provider is misconfigured or fails, the worker falls back to the deterministic `template` client that produces a readable, no-network digest from the source titles. This prevents empty days but produces less interesting prose.
- Secrets must never live in the repo. Always use the host's secret store.
