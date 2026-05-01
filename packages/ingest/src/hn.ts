import { canonicalizeUrl, urlHash } from '@smr/content';
import type { Category, NormalizedSource } from '@smr/types';
import { fetchJson } from './http';
import type { AdapterContext, CategoryFetchOptions, SourceAdapter } from './types';

interface HnItem {
  id: number;
  type?: string;
  title?: string;
  url?: string;
  by?: string;
  time?: number;
  text?: string;
  score?: number;
  descendants?: number;
}

const HN_BASE = 'https://hacker-news.firebaseio.com/v0';

const CATEGORY_LIST: Record<Category, string> = {
  tech: 'topstories.json',
  news: 'beststories.json',
  diy: 'topstories.json',
  til: 'topstories.json',
};

export const hnAdapter: SourceAdapter = {
  kind: 'HN',
  async fetchForCategory(
    { category, limit = 10 }: CategoryFetchOptions,
    ctx: AdapterContext,
  ): Promise<NormalizedSource[]> {
    if (category === 'diy' || category === 'til') return [];

    const ids = await fetchJson<number[]>(`${HN_BASE}/${CATEGORY_LIST[category]}`, {
      userAgent: ctx.userAgent,
      timeoutMs: ctx.fetchTimeoutMs,
    });
    const slice = ids.slice(0, limit);
    const out: NormalizedSource[] = [];
    for (const id of slice) {
      try {
        const item = await fetchJson<HnItem>(`${HN_BASE}/item/${id}.json`, {
          userAgent: ctx.userAgent,
          timeoutMs: ctx.fetchTimeoutMs,
        });
        if (!item || (item.type && item.type !== 'story') || !item.title) continue;
        const targetUrl = item.url ?? `https://news.ycombinator.com/item?id=${item.id}`;
        const canonical = canonicalizeUrl(targetUrl);
        out.push({
          kind: 'HN',
          externalId: String(item.id),
          url: canonical,
          urlHash: urlHash(canonical),
          title: item.title.trim().slice(0, 500),
          author: item.by ?? null,
          publishedAt: item.time ? new Date(item.time * 1000) : null,
          category,
          language: 'en',
          payload: {
            score: item.score ?? null,
            descendants: item.descendants ?? null,
            hnUrl: `https://news.ycombinator.com/item?id=${item.id}`,
            textPreview: (item.text ?? '').slice(0, 500),
          },
        });
      } catch {
        continue;
      }
    }
    return out;
  },
};
