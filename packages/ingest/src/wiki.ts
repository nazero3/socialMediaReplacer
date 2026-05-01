import { canonicalizeUrl, urlHash } from '@smr/content';
import type { Category, NormalizedSource } from '@smr/types';
import { fetchJson } from './http';
import type { AdapterContext, CategoryFetchOptions, SourceAdapter } from './types';

interface OnThisDayResponse {
  events?: Array<{
    text: string;
    year?: number;
    pages?: Array<{
      title: string;
      content_urls?: { desktop?: { page?: string } };
      extract?: string;
    }>;
  }>;
}

export const wikiAdapter: SourceAdapter = {
  kind: 'WIKI',
  async fetchForCategory(
    { category, limit = 10 }: CategoryFetchOptions,
    ctx: AdapterContext,
  ): Promise<NormalizedSource[]> {
    if (category !== 'til') return [];
    const now = new Date();
    const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(now.getUTCDate()).padStart(2, '0');
    const url = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${mm}/${dd}`;
    const json = await fetchJson<OnThisDayResponse>(url, {
      userAgent: ctx.userAgent,
      timeoutMs: ctx.fetchTimeoutMs,
    });
    const events = (json.events ?? []).slice(0, limit);
    const out: NormalizedSource[] = [];
    for (const ev of events) {
      const page = ev.pages?.[0];
      if (!page) continue;
      const target = page.content_urls?.desktop?.page;
      if (!target) continue;
      const canonical = canonicalizeUrl(target);
      out.push({
        kind: 'WIKI',
        externalId: `${mm}-${dd}-${ev.year ?? 'na'}-${page.title}`,
        url: canonical,
        urlHash: urlHash(canonical),
        title: page.title,
        author: 'Wikipedia contributors',
        publishedAt: ev.year ? new Date(Date.UTC(ev.year, 0, 1)) : null,
        category: 'til' as Category,
        language: 'en',
        payload: {
          eventText: ev.text,
          extract: page.extract ?? null,
          year: ev.year ?? null,
        },
      });
    }
    return out;
  },
};
