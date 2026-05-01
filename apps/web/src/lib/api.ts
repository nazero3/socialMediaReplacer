import type { ArticleDetail, PaginatedArticles } from '@smr/types';
import { getFeedArticles, getFeedSummaries } from './feeds';

export function getArticles(params: { category?: string; page?: number; limit?: number } = {}) {
  return getFeedSummaries(params) as Promise<PaginatedArticles>;
}

export async function getArticleBySlug(slug: string): Promise<ArticleDetail> {
  const articles = await getFeedArticles();
  const article = articles.find((a) => a.slug === slug);
  if (!article) throw new Error('Not found');
  return article;
}

export async function searchArticles(q: string): Promise<{ items: PaginatedArticles['items']; q: string }> {
  const t = q.trim().toLowerCase();
  if (t.length < 2) return { items: [], q };
  const all = (await getFeedSummaries({ limit: 100 })).items;
  return {
    q,
    items: all.filter(
      (a) => a.title.toLowerCase().includes(t) || a.summary.toLowerCase().includes(t),
    ),
  };
}
