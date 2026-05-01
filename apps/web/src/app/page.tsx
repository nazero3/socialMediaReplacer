import Link from 'next/link';
import type { JSX } from 'react';
import { ArticleCard } from '@smr/ui';
import { getArticles } from '@/lib/api';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export const revalidate = 60;

export default async function HomePage(): Promise<JSX.Element> {
  let items: Awaited<ReturnType<typeof getArticles>>['items'] = [];
  try {
    const data = await getArticles({ limit: 12 });
    items = data.items;
  } catch {
    items = [];
  }
  return (
    <main className="page">
      <SiteHeader />
      <h1 style={{ fontSize: '2.4rem', margin: 0 }}>Today</h1>
      <p className="lede">A finite list. Read what calls to you. Close the tab when you&apos;re done.</p>
      {items.length === 0 ? (
        <p>No feed items available right now. Try again in a minute.</p>
      ) : (
        <div className="card-list">
          {items.map((a) => (
            <ArticleCard key={a.id} article={a} href={`/article/${a.slug}`} />
          ))}
        </div>
      )}
      <p style={{ marginTop: 32, color: 'var(--color-text-muted)' }}>
        Browse by category:{' '}
        <Link href="/category/tech">Tech</Link>
        {' · '}
        <Link href="/category/news">News</Link>
        {' · '}
        <Link href="/category/diy">DIY</Link>
        {' · '}
        <Link href="/category/til">TIL</Link>
      </p>
      <SiteFooter />
    </main>
  );
}
