import { cache } from 'react';
import type { ArticleDetail, ArticleSummary, Category } from '@smr/types';

type FeedRecord = {
  id: string;
  title: string;
  summary: string;
  url: string;
  category: Category;
  sourceKind: 'REDDIT' | 'HN' | 'WIKI' | 'RSS';
  author?: string | null;
  publishedAt: string;
};

const REDDIT_SOURCES: Array<{ sub: string; category: Category }> = [
  { sub: 'technology', category: 'tech' },
  { sub: 'programming', category: 'tech' },
  { sub: 'worldnews', category: 'news' },
  { sub: 'news', category: 'news' },
  { sub: 'DIY', category: 'diy' },
  { sub: 'todayilearned', category: 'til' },
];

async function fetchReddit(): Promise<FeedRecord[]> {
  const all: FeedRecord[] = [];
  await Promise.all(
    REDDIT_SOURCES.map(async ({ sub, category }) => {
      try {
        const res = await fetch(
          `https://www.reddit.com/r/${encodeURIComponent(sub)}/top.json?t=day&limit=6`,
          { headers: { 'User-Agent': 'socialMediaReplacer/0.1 (+github pages)' } },
        );
        if (!res.ok) return;
        const json = (await res.json()) as {
          data?: { children?: Array<{ data?: Record<string, unknown> }> };
        };
        for (const child of json.data?.children ?? []) {
          const d = (child.data ?? {}) as Record<string, unknown>;
          const id = String(d.id ?? '');
          const title = String(d.title ?? '').trim();
          if (!id || !title) continue;
          const externalUrl = String(
            d.url_overridden_by_dest ?? d.url ?? `https://www.reddit.com${String(d.permalink ?? '')}`,
          );
          const permalink = `https://www.reddit.com${String(d.permalink ?? '')}`;
          all.push({
            id: `reddit-${id}`,
            title,
            summary: String(d.selftext ?? '').replace(/\s+/g, ' ').slice(0, 220) || `Top story from r/${sub}.`,
            url: d.is_self ? permalink : externalUrl,
            category,
            sourceKind: 'REDDIT',
            author: String(d.author ?? '') || null,
            publishedAt: new Date(Number(d.created_utc ?? 0) * 1000 || Date.now()).toISOString(),
          });
        }
      } catch {
        // ignore source failures, keep site rendering.
      }
    }),
  );
  return all;
}

async function fetchHn(): Promise<FeedRecord[]> {
  try {
    const idsRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
    if (!idsRes.ok) return [];
    const ids = ((await idsRes.json()) as number[]).slice(0, 20);
    const items = await Promise.all(
      ids.map(async (id) => {
        try {
          const res = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
          if (!res.ok) return null;
          const j = (await res.json()) as Record<string, unknown>;
          if (j.type !== 'story' || !j.title) return null;
          return {
            id: `hn-${id}`,
            title: String(j.title),
            summary: 'Top community-ranked story from Hacker News.',
            url: String(j.url ?? `https://news.ycombinator.com/item?id=${id}`),
            category: 'tech' as const,
            sourceKind: 'HN' as const,
            author: String(j.by ?? '') || null,
            publishedAt: new Date(Number(j.time ?? 0) * 1000 || Date.now()).toISOString(),
          };
        } catch {
          return null;
        }
      }),
    );
    return items.filter(Boolean) as FeedRecord[];
  } catch {
    return [];
  }
}

async function fetchWikipediaTil(): Promise<FeedRecord[]> {
  try {
    const d = new Date();
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${mm}/${dd}`);
    if (!res.ok) return [];
    const json = (await res.json()) as {
      events?: Array<{ text?: string; pages?: Array<{ title?: string; content_urls?: { desktop?: { page?: string } } }> }>;
    };
    return (json.events ?? []).slice(0, 6).flatMap((e, idx) => {
      const p = e.pages?.[0];
      if (!p?.title || !p.content_urls?.desktop?.page) return [];
      return [
        {
          id: `wiki-${idx}-${p.title}`,
          title: p.title,
          summary: (e.text ?? 'On this day in history.').slice(0, 220),
          url: p.content_urls.desktop.page,
          category: 'til' as const,
          sourceKind: 'WIKI' as const,
          author: 'Wikipedia contributors',
          publishedAt: new Date().toISOString(),
        },
      ];
    });
  } catch {
    return [];
  }
}

function toArticle(r: FeedRecord): ArticleDetail {
  const body = `## Source summary\n\n${r.summary}\n\n## Read the original\n\nOpen the source link below for the full piece.`;
  return {
    id: r.id,
    slug: slugify(r.id + '-' + r.title),
    title: r.title,
    summary: r.summary,
    category: r.category,
    kind: 'FEATURE',
    readingTimeSec: 120,
    publishedAt: r.publishedAt,
    heroImageUrl: null,
    bodyMarkdown: body,
    updatedAt: r.publishedAt,
    sources: [
      {
        id: `${r.id}-source`,
        url: r.url,
        title: r.title,
        author: r.author ?? null,
        publishedAt: r.publishedAt,
        kind: r.sourceKind,
        position: 0,
      },
    ],
    tags: [{ slug: r.category, name: r.category.toUpperCase() }],
  };
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 100);
}

export const getFeedArticles = cache(async (): Promise<ArticleDetail[]> => {
  const [reddit, hn, wiki] = await Promise.all([fetchReddit(), fetchHn(), fetchWikipediaTil()]);
  const merged = [...reddit, ...hn, ...wiki];
  const seen = new Set<string>();
  const unique = merged.filter((r) => {
    const k = r.url.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  return unique
    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
    .slice(0, 40)
    .map(toArticle);
});

export async function getFeedSummaries(params: {
  category?: string;
  page?: number;
  limit?: number;
}): Promise<{ items: ArticleSummary[]; page: number; limit: number; total: number }> {
  const page = Math.max(1, Number(params.page ?? 1));
  const limit = Math.max(1, Number(params.limit ?? 20));
  const all = await getFeedArticles();
  const filtered = params.category ? all.filter((a) => a.category === params.category) : all;
  const start = (page - 1) * limit;
  const items = filtered.slice(start, start + limit).map((a) => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    summary: a.summary,
    category: a.category,
    kind: a.kind,
    readingTimeSec: a.readingTimeSec,
    publishedAt: a.publishedAt,
    heroImageUrl: a.heroImageUrl,
  }));
  return { items, page, limit, total: filtered.length };
}

