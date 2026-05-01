# socialMediaReplacer

A reader-first, multi-source blog platform that replaces social-media doomscrolling with **calm, paced reading**. Daily documentary-style articles in **Tech, News, DIY, and TIL**, ingested from Reddit, Hacker News, Wikipedia, and RSS — with full attribution.

> One "Today" page. No infinite scroll. No engagement mechanics.

## Monorepo layout

```text
apps/
  web/       Next.js 15 (App Router, ISR)
  mobile/    Expo (React Native, expo-router)
  api/       Fastify + Prisma
  worker/    BullMQ workers (ingestion + digest)
packages/
  ui/        shared React components (web)
  theme/     tokens (sepia palette + type scale)
  types/     shared TypeScript types
  content/   markdown renderer config + reading time
  ingest/    source adapters (reddit, hn, wiki, rss)
docs/
  SRS.md, ARCHITECTURE.md, DEPLOYMENT.md
```

## Quick start

```bash
pnpm install
cp .env.example .env
docker compose up -d            # Postgres + Redis
pnpm --filter @smr/api db:push  # apply Prisma schema
pnpm --filter @smr/api db:seed  # seed categories + RSS feeds
pnpm dev                        # turbo runs all apps in parallel
```

Apps:
- Web: <http://localhost:3000>
- API: <http://localhost:4000>
- Mobile: `pnpm --filter @smr/mobile start` (Expo)

## Documentation
- [`docs/SRS.md`](docs/SRS.md) — Software Requirements Specification (V1).
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — System diagram, data model, pipelines.
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — Vercel + Fly.io + Expo EAS.

## Theme
A warm, paper-like palette designed for long reading sessions. Light mode is sepia-on-paper; dark mode is parchment-on-charcoal. Body type is `Lora` 18px / 1.7 line-height, max 68ch.

## License
MIT.
