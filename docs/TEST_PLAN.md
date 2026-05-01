# Test Plan

## Unit
- `packages/content/src/__tests__/canonical.test.ts` — URL canonicalization and hashing (FR-1.4, AC-1).
- `packages/content/src/__tests__/toc.test.ts` — TOC extraction (FR-3.3) and reading time bounds.
- `apps/api/src/__tests__/feed.test.ts` — Atom feed XML shape (FR-3.6, AC-5).

Run: `pnpm --filter @smr/content test`, `pnpm --filter @smr/api test`.

## Integration (manual or scripted)
- Run the worker once with `pnpm --filter @smr/worker ingest:once`. Verify `IngestRun` row exists and `Source` rows are present.
- Re-run `ingest:once`. Verify no new rows for already-seen URLs (AC-1).
- Run `pnpm --filter @smr/worker digest:once`. Verify a `DigestRun` and an `Article` (kind=DIGEST) appear with ≥3 `ArticleSource` rows (AC-2, AC-3).
- Re-run `digest:once` for the same UTC date. Verify only one `Article` exists per `(date, category)` (AC-2).

## End-to-end (web)
- `apps/web/e2e/reader.spec.ts` covers the home page render and the theme toggle.
- Add `axe-core` checks: load `/` and `/article/[slug]` and assert no contrast violations in either theme (AC-8 → NFR-2.1).

## Performance
- Lighthouse mobile run on `/article/[slug]`. Targets:
  - Performance ≥ 90.
  - LCP < 1.5s.
  - CLS < 0.05.
- Reading-page font preconnect is already configured in `apps/web/src/app/layout.tsx`.

## Manual checks
- Mobile offline reading: open an article online, kill connectivity, re-open. Cached version must render (AC-6).
- Admin: `curl -X POST -H 'Authorization: Bearer $ADMIN_TOKEN' $API/admin/reingest` returns 202; without token returns 401 (AC-9).
- Source attribution: every published article page lists every source URL with publisher (AC-10).
