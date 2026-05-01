# Software Requirements Specification

**Project:** socialMediaReplacer — a comforting, reader-first blog platform
**Version:** 1.0 (MVP)
**Status:** Approved baseline for V1 implementation
**Document conventions:** IEEE 830 (trimmed). RFC 2119 keywords (MUST, SHOULD, MAY) are used.

---

## 1. Introduction

### 1.1 Purpose
This document specifies the requirements for an MVP web-and-mobile reading platform whose explicit goal is to **replace social-media doomscrolling with calm, paced reading**. It publishes one or more daily "documentary-style" articles per category, generated from public sources (Reddit, Hacker News, Wikipedia, RSS), with full attribution and link-out to originals.

### 1.2 Scope
- Public reading surfaces: a Next.js website and an Expo (React Native) mobile app.
- A backend API that serves curated content from a Postgres database.
- A scheduled worker that ingests sources and produces daily digest articles via a pluggable LLM.
- A small admin surface (token-protected) for re-running ingestion and hiding articles.
- **Out of scope for V1:** user accounts, social features (comments, likes, follows), push notifications, paid integrations.

### 1.3 Definitions
- **Source** — a single ingested item from an upstream provider (a Reddit post, an HN story, an RSS entry, a Wikipedia "On this day" entry).
- **Article** — a piece of content published by us. Two kinds: `DIGEST` (AI-assembled from same-day Sources) and `FEATURE` (editorial, manual).
- **Category** — one of: `tech`, `news`, `diy`, `til`.
- **Digest** — a daily `Article` with `kind = DIGEST` for a single category, idempotent on `(date, category)`.
- **Reader** — an unauthenticated end user (web or mobile).
- **Admin** — an operator holding the `ADMIN_TOKEN`.

### 1.4 References
- IEEE Std 830-1998.
- WCAG 2.1 AA.
- Reddit API Terms — <https://www.redditinc.com/policies/data-api-terms>.
- Hacker News Firebase API — <https://github.com/HackerNews/API>.
- Wikipedia REST — <https://en.wikipedia.org/api/rest_v1/>.

---

## 2. Overall Description

### 2.1 Product perspective
A standalone reading app. Deliberately **not** a feed/social product:
- No infinite scroll. The "Today" page is a finite list.
- No engagement mechanics (no like/share counters, no streaks, no notifications-as-engagement).
- No comments in V1.
- Reading mode hides chrome entirely.

### 2.2 User classes
| Class | Auth | Capabilities |
|-------|------|--------------|
| Reader | Anonymous | Read articles, browse categories, search, bookmark locally, change theme/font size. |
| Editor | (Phase 2) | Promote/demote ingested items, edit copy. |
| Admin  | `ADMIN_TOKEN` (header) | Trigger re-ingest, hide articles, regenerate digest. |

### 2.3 Operating environment
- **Web:** evergreen Chromium, Firefox, Safari (last 2 versions). Mobile Safari iOS 16+, Chrome Android 10+.
- **Mobile:** iOS 16+, Android 10+ (API 29+). Expo SDK 50+.
- **Backend:** Node.js 20 LTS, Postgres 16, Redis 7.

### 2.4 Constraints
- C-1 MUST respect each source's rate limits and ToS, including a custom User-Agent for Reddit.
- C-2 MUST always show original source attribution and a link out to the original.
- C-3 MUST NOT republish full upstream article bodies; digests paraphrase + cite.
- C-4 No paid third-party APIs in V1.
- C-5 No PII collected. No analytics that cookies users in V1.

### 2.5 Assumptions and dependencies
- An LLM provider is available (default OpenAI; pluggable to Anthropic/Ollama).
- Hosting: Vercel (web), Fly.io or Railway (api+worker+db+redis), Expo EAS (mobile).
- Local bookmarks and history are stored client-side only (`localStorage` web, `AsyncStorage` mobile).

---

## 3. Functional Requirements

### 3.1 Content ingestion
- **FR-1.1** The system MUST run scheduled ingestion every 6 hours.
- **FR-1.2** Each run MUST fan out per source kind and category and pull the top N items (configurable, default 25).
- **FR-1.3** Each ingested item MUST be normalized into a `Source` row containing `kind`, `externalId`, `url`, `urlHash`, `title`, `author`, `publishedAt`, `fetchedAt`, `category`, `payload (JSON)`, `language`.
- **FR-1.4** Deduplication MUST be performed by SHA-256 of the canonical URL (`urlHash`), unique across `Source`.
- **FR-1.5** Each ingestion run MUST be recorded in `IngestRun` with start/end time, source kind, items fetched, items new, error (if any).
- **FR-1.6** Failures of any single source MUST NOT abort other sources.
- **FR-1.7** A custom User-Agent string MUST be sent to Reddit per their API ToS.

### 3.2 Digest generation
- **FR-2.1** Once per UTC day at 06:00, for each Category, the system MUST attempt to produce one `Article` of `kind = DIGEST`.
- **FR-2.2** Generation MUST be idempotent on `(date, category)` and tracked in `DigestRun`.
- **FR-2.3** A digest MUST cite at least 3 distinct sources via `ArticleSource` rows; each citation includes `position` for ordering.
- **FR-2.4** A digest MUST NOT reproduce upstream article bodies verbatim. It paraphrases and links.
- **FR-2.5** If the LLM call fails, the run is marked failed in `DigestRun` and retried on next schedule (max 3 retries with backoff).
- **FR-2.6** The LLM client MUST be pluggable behind a single interface; provider chosen by env var.

### 3.3 Reader experience
- **FR-3.1** The web and mobile apps MUST present a "Today" home page listing the most recent published articles, grouped or filterable by category.
- **FR-3.2** The article reader MUST display: title, summary, body (markdown), reading time, publish date, category, source citations with link-out.
- **FR-3.3** The reader MUST offer: theme toggle (light/dark), font-size toggle (3 steps), and a table of contents derived from H2 headings.
- **FR-3.4** The reader content area MUST be limited to ~68ch and use a serif body font.
- **FR-3.5** Search MUST support keyword search on `title` and `summary`.
- **FR-3.6** RSS feed MUST be served at `/feed.xml` containing the latest 50 published articles (Atom 1.0).

### 3.4 Personalization (device-only)
- **FR-4.1** Readers MUST be able to bookmark articles. Bookmarks live on the device only (`localStorage` / `AsyncStorage`).
- **FR-4.2** Recently-read history MUST be tracked client-side, capped at 100 entries.
- **FR-4.3** Mobile app MUST cache the last 50 viewed articles for offline reading.

### 3.5 Admin
- **FR-5.1** `POST /admin/reingest` MUST trigger an ingest run; auth via `Authorization: Bearer <ADMIN_TOKEN>`.
- **FR-5.2** `POST /admin/articles/:id/hide` MUST set `Article.status = HIDDEN`.
- **FR-5.3** `POST /admin/articles/:id/unhide` MUST restore `status = PUBLISHED`.
- **FR-5.4** Admin endpoints MUST be rate-limited and audit-logged.

---

## 4. Non-Functional Requirements

### 4.1 Performance
- **NFR-1.1** Reader page Largest Contentful Paint < 1.5s on a simulated 4G connection (Lighthouse mobile).
- **NFR-1.2** Cumulative Layout Shift < 0.05 on the article page.
- **NFR-1.3** API p95 latency < 200 ms for cached `/articles` and `/articles/:slug`.

### 4.2 Accessibility
- **NFR-2.1** WCAG 2.1 AA color contrast in both light and dark themes.
- **NFR-2.2** All interactive elements MUST be keyboard reachable on web with visible focus.
- **NFR-2.3** Mobile reader MUST honor system Dynamic Type / accessibility font scaling.

### 4.3 Reliability
- **NFR-3.1** Ingest job retries: 3 with exponential backoff (1m, 5m, 30m).
- **NFR-3.2** No single failed source kind blocks others.

### 4.4 Security and privacy
- **NFR-4.1** Secrets MUST only live in environment variables; never committed.
- **NFR-4.2** No PII collected in V1. No third-party analytics that set cookies.
- **NFR-4.3** Admin endpoints MUST require `ADMIN_TOKEN` and use timing-safe comparison.

### 4.5 Compliance
- **NFR-5.1** Ingestion MUST respect each source's `robots.txt` and rate limits.
- **NFR-5.2** Every published article MUST link to its sources with author and date.

### 4.6 Maintainability
- **NFR-6.1** End-to-end TypeScript with shared types in `packages/types`.
- **NFR-6.2** Lint (eslint), format (prettier), and a green CI MUST gate merges.

---

## 5. External Interfaces

### 5.1 Upstream APIs
| Provider | Endpoint | Auth | Notes |
|----------|----------|------|-------|
| Reddit | `https://www.reddit.com/r/<sub>/top.json?t=day&limit=N` | None (User-Agent required) | Per-subreddit per-category mapping. |
| Hacker News | `https://hacker-news.firebaseio.com/v0/topstories.json` then `/v0/item/<id>.json` | None | Used for `tech` and `news`. |
| Wikipedia REST | `https://en.wikipedia.org/api/rest_v1/feed/onthisday/all/<MM>/<DD>` and `/feed/featured/<YYYY>/<MM>/<DD>` | None | Used for `til`. |
| RSS | Configurable feed list | None | Used for `news`, `diy`. |
| LLM | OpenAI Chat Completions (default) | `OPENAI_API_KEY` | Pluggable interface. |

### 5.2 Internal API (high-level)
- `GET /articles?category=&page=&limit=`
- `GET /articles/:slug`
- `GET /categories/:slug` (alias of articles?category=)
- `GET /search?q=`
- `GET /feed.xml`
- `POST /admin/reingest` (admin)
- `POST /admin/articles/:id/hide` (admin)
- `POST /admin/articles/:id/unhide` (admin)

---

## 6. Data Model
See `docs/ARCHITECTURE.md` §3 for the entity relationship diagram and full Prisma schema commentary.

Key entities:
- `Source(id, kind, externalId, url, urlHash UNIQUE, title, author, publishedAt, fetchedAt, category, payload Json, language)`
- `Article(id, slug UNIQUE, title, summary, bodyMarkdown, heroImageUrl?, category, status, kind, readingTimeSec, publishedAt, updatedAt)`
- `ArticleSource(articleId, sourceId, position) PK(articleId, sourceId)`
- `Tag(id, slug UNIQUE, name)`, `ArticleTag(articleId, tagId)`
- `IngestRun(id, startedAt, finishedAt, sourceKind, itemsFetched, itemsNew, error?)`
- `DigestRun(id, runDate Date, category, status, error?, articleId?)` UNIQUE`(runDate, category)`

---

## 7. Acceptance Criteria

| ID | Requirement | Verifying test |
|----|-------------|----------------|
| AC-1 | FR-1.1, FR-1.4 | Run worker; verify duplicate URL is not re-inserted. |
| AC-2 | FR-2.2 | Run digest twice for same `(date, category)`; verify only one `Article` exists. |
| AC-3 | FR-2.3 | Inspect generated digest; ensure ≥ 3 `ArticleSource` rows. |
| AC-4 | FR-3.2, FR-3.3 | Open article on web/mobile; verify TOC, font-size toggle, theme toggle, source citations. |
| AC-5 | FR-3.6 | Fetch `/feed.xml`; validate Atom and ≤ 50 entries. |
| AC-6 | FR-4.3 | Mobile: turn off network, open previously visited article; content still renders. |
| AC-7 | NFR-1.1 | Lighthouse mobile run on `/article/[slug]` returns LCP < 1.5s. |
| AC-8 | NFR-2.1 | axe-core run reports no contrast violations in either theme. |
| AC-9 | FR-5.1 | `POST /admin/reingest` without token returns 401; with token returns 202. |
| AC-10 | C-2 | Every article page lists every source URL with original publisher. |

---

## 8. Open Questions / Phase 2
- Editor user class with login.
- Per-user sync of bookmarks (would require accounts).
- Comments / discussion (deliberately deferred — would change product thesis).
- Push notifications for digests (off by default; requires accounts).
