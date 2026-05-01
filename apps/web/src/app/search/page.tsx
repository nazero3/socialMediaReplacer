import { ArticleCard } from '@smr/ui';
import { searchArticles } from '@/lib/api';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? '').trim();
  let items: Awaited<ReturnType<typeof searchArticles>>['items'] = [];
  if (query.length >= 2) {
    try {
      const res = await searchArticles(query);
      items = res.items;
    } catch {
      items = [];
    }
  }
  return (
    <main className="page">
      <SiteHeader />
      <h1>Search</h1>
      <form action="/search" method="get" className="controls" role="search">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Find an article…"
          aria-label="Search"
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            borderRadius: 8,
            font: 'inherit',
          }}
        />
        <button type="submit">Search</button>
      </form>
      {query.length < 2 ? (
        <p className="lede">Type at least two characters.</p>
      ) : items.length === 0 ? (
        <p>No matches for &ldquo;{query}&rdquo;.</p>
      ) : (
        <div className="card-list">
          {items.map((a) => (
            <ArticleCard key={a.id} article={a} href={`/article/${a.slug}`} />
          ))}
        </div>
      )}
      <SiteFooter />
    </main>
  );
}
