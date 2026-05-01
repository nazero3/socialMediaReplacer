import { canonicalizeUrl, urlHash } from '@smr/content';
import type { Category, NormalizedSource } from '@smr/types';
import { fetchJson } from './http';
import type { AdapterContext, CategoryFetchOptions, SourceAdapter } from './types';

const SUBREDDITS_BY_CATEGORY: Record<Category, string[]> = {
  tech: ['technology', 'programming', 'gadgets'],
  news: ['worldnews', 'news'],
  diy: ['DIY', 'somethingimade', 'lifehacks'],
  til: ['todayilearned'],
};

interface RedditChild {
  data: {
    id: string;
    title: string;
    url_overridden_by_dest?: string;
    url: string;
    author: string;
    permalink: string;
    created_utc: number;
    selftext?: string;
    is_self?: boolean;
    over_18?: boolean;
    stickied?: boolean;
  };
}

interface RedditListing {
  data: { children: RedditChild[] };
}

export const redditAdapter: SourceAdapter = {
  kind: 'REDDIT',
  async fetchForCategory(
    { category, limit = 10 }: CategoryFetchOptions,
    ctx: AdapterContext,
  ): Promise<NormalizedSource[]> {
    const subs = SUBREDDITS_BY_CATEGORY[category];
    const out: NormalizedSource[] = [];
    const perSub = Math.max(1, Math.ceil(limit / subs.length));
    for (const sub of subs) {
      const url = `https://www.reddit.com/r/${encodeURIComponent(sub)}/top.json?t=day&limit=${perSub}`;
      try {
        const json = await fetchJson<RedditListing>(url, {
          userAgent: ctx.userAgent,
          timeoutMs: ctx.fetchTimeoutMs,
        });
        for (const child of json.data.children ?? []) {
          const d = child.data;
          if (d.over_18 || d.stickied) continue;
          const targetUrl = d.is_self
            ? `https://www.reddit.com${d.permalink}`
            : (d.url_overridden_by_dest ?? d.url);
          if (!targetUrl) continue;
          const canonical = canonicalizeUrl(targetUrl);
          out.push({
            kind: 'REDDIT',
            externalId: `t3_${d.id}`,
            url: canonical,
            urlHash: urlHash(canonical),
            title: d.title.trim().slice(0, 500),
            author: d.author ?? null,
            publishedAt: new Date(d.created_utc * 1000),
            category,
            language: 'en',
            payload: {
              subreddit: sub,
              permalink: `https://www.reddit.com${d.permalink}`,
              selftextPreview: (d.selftext ?? '').slice(0, 500),
            },
          });
        }
      } catch (err) {
        // Surface per-subreddit failures in payload; never throw to caller.
        out.push(failureMarker(category, sub, err));
      }
    }
    return out.filter((s) => !('__error' in s.payload));
  },
};

function failureMarker(category: Category, sub: string, err: unknown): NormalizedSource {
  const msg = err instanceof Error ? err.message : String(err);
  const fakeUrl = `internal://reddit-error/${category}/${sub}/${Date.now()}`;
  return {
    kind: 'REDDIT',
    externalId: `error_${Date.now()}`,
    url: fakeUrl,
    urlHash: urlHash(fakeUrl),
    title: `[reddit error] ${sub}`,
    author: null,
    publishedAt: new Date(),
    category,
    language: 'en',
    payload: { __error: msg, sub },
  };
}
