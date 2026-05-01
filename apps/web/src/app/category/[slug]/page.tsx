import { notFound } from 'next/navigation';
import { ArticleCard } from '@smr/ui';
import { CATEGORY_LABELS, isCategory } from '@smr/types';
import { getArticles } from '@/lib/api';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export const revalidate = 60;

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isCategory(slug)) notFound();
  let items: Awaited<ReturnType<typeof getArticles>>['items'] = [];
  try {
    const data = await getArticles({ category: slug, limit: 30 });
    items = data.items;
  } catch {
    items = [];
  }
  return (
    <main className="page">
      <SiteHeader />
      <h1>{CATEGORY_LABELS[slug]}</h1>
      <p className="lede">Daily reading in {CATEGORY_LABELS[slug].toLowerCase()}.</p>
      {items.length === 0 ? (
        <p>No articles yet in this category.</p>
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
