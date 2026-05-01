import type { ArticleDetail, PaginatedArticles } from '@smr/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

interface FetchOpts {
  revalidate?: number;
  cache?: RequestCache;
}

async function get<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    next: opts.revalidate !== undefined ? { revalidate: opts.revalidate } : undefined,
    cache: opts.cache,
  });
  if (!res.ok) throw new Error(`API ${path} -> ${res.status}`);
  return (await res.json()) as T;
}

export function getArticles(params: { category?: string; page?: number; limit?: number } = {}) {
  const search = new URLSearchParams();
  if (params.category) search.set('category', params.category);
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  const qs = search.toString();
  return get<PaginatedArticles>(`/articles${qs ? `?${qs}` : ''}`, { revalidate: 60 });
}

export function getArticleBySlug(slug: string) {
  return get<ArticleDetail>(`/articles/${encodeURIComponent(slug)}`, { revalidate: 300 });
}

export function searchArticles(q: string) {
  return get<{ items: PaginatedArticles['items']; q: string }>(
    `/search?q=${encodeURIComponent(q)}`,
    { cache: 'no-store' },
  );
}
