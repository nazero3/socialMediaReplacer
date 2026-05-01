import type { JSX } from 'react';
import { ArticleCard } from '@smr/ui';
import { getArticles } from '@/lib/api';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export default async function SearchPage(): Promise<JSX.Element> {
  const items = (await getArticles({ limit: 40 })).items;
  return (
    <main className="page">
      <SiteHeader />
      <h1>Search</h1>
      <p className="lede">
        Static mode on GitHub Pages does not support server query params. Browse this index and use
        your browser find (`Ctrl+F`) for quick filtering.
      </p>
      <div className="card-list">
        {items.map((a) => (
          <ArticleCard key={a.id} article={a} href={`/article/${a.slug}`} />
        ))}
      </div>
      <SiteFooter />
    </main>
  );
}
