import Constants from 'expo-constants';
import type { ArticleDetail, PaginatedArticles } from '@smr/types';

const apiUrl =
  (Constants.expoConfig?.extra as Record<string, string> | undefined)?.apiUrl ??
  'http://localhost:4000';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${apiUrl}${path}`);
  if (!res.ok) throw new Error(`API ${path} -> ${res.status}`);
  return (await res.json()) as T;
}

export function getArticles(category?: string) {
  const qs = category ? `?category=${encodeURIComponent(category)}&limit=30` : '?limit=20';
  return get<PaginatedArticles>(`/articles${qs}`);
}

export function getArticleBySlug(slug: string) {
  return get<ArticleDetail>(`/articles/${encodeURIComponent(slug)}`);
}
