import { canonicalizeUrl, urlHash } from '@smr/content';
import type { Category, NormalizedSource } from '@smr/types';
import { XMLParser } from 'fast-xml-parser';
import { fetchText } from './http';
import type { AdapterContext, CategoryFetchOptions, SourceAdapter } from './types';

export interface RssFeedConfig {
  category: Category;
  url: string;
  publisher: string;
}

export const DEFAULT_RSS_FEEDS: RssFeedConfig[] = [
  { category: 'news', url: 'https://feeds.bbci.co.uk/news/world/rss.xml', publisher: 'BBC' },
  { category: 'news', url: 'https://www.aljazeera.com/xml/rss/all.xml', publisher: 'Al Jazeera' },
  { category: 'tech', url: 'https://techcrunch.com/feed/', publisher: 'TechCrunch' },
  { category: 'tech', url: 'https://feeds.arstechnica.com/arstechnica/index', publisher: 'Ars Technica' },
  { category: 'tech', url: 'https://www.theverge.com/rss/index.xml', publisher: 'The Verge' },
  { category: 'diy', url: 'https://makezine.com/feed/', publisher: 'Make:' },
  { category: 'diy', url: 'https://www.instructables.com/feed.rss', publisher: 'Instructables' },
];

interface RssItem {
  title?: string | { '#text'?: string };
  link?: string | { '@_href'?: string; '#text'?: string };
  guid?: string | { '#text'?: string };
  pubDate?: string;
  published?: string;
  updated?: string;
  'dc:creator'?: string;
  author?: string | { name?: string };
  description?: string;
  summary?: string;
}

interface RssDoc {
  rss?: { channel?: { item?: RssItem | RssItem[] } };
  feed?: { entry?: RssItem | RssItem[] };
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
});

function pickText(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'object' && value !== null) {
    const v = value as Record<string, unknown>;
    if (typeof v['#text'] === 'string') return (v['#text'] as string).trim();
    if (typeof v.name === 'string') return (v.name as string).trim();
  }
  return null;
}

function pickLink(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === 'string') return value.trim();
  if (Array.isArray(value)) {
    for (const v of value) {
      const got = pickLink(v);
      if (got) return got;
    }
    return null;
  }
  if (typeof value === 'object' && value !== null) {
    const v = value as Record<string, unknown>;
    if (typeof v['@_href'] === 'string') return v['@_href'] as string;
    if (typeof v['#text'] === 'string') return v['#text'] as string;
  }
  return null;
}

function pickDate(...values: Array<string | undefined>): Date | null {
  for (const v of values) {
    if (!v) continue;
    const d = new Date(v);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return null;
}

export function buildRssAdapter(feeds: RssFeedConfig[] = DEFAULT_RSS_FEEDS): SourceAdapter {
  return {
    kind: 'RSS',
    async fetchForCategory(
      { category, limit = 10 }: CategoryFetchOptions,
      ctx: AdapterContext,
    ): Promise<NormalizedSource[]> {
      const matching = feeds.filter((f) => f.category === category);
      if (matching.length === 0) return [];
      const perFeed = Math.max(1, Math.ceil(limit / matching.length));
      const out: NormalizedSource[] = [];
      for (const feed of matching) {
        try {
          const xml = await fetchText(feed.url, {
            userAgent: ctx.userAgent,
            timeoutMs: ctx.fetchTimeoutMs,
          });
          const doc = parser.parse(xml) as RssDoc;
          const rawItems = doc.rss?.channel?.item ?? doc.feed?.entry ?? [];
          const list = Array.isArray(rawItems) ? rawItems : [rawItems];
          for (const item of list.slice(0, perFeed)) {
            const title = pickText(item.title);
            const link = pickLink(item.link) ?? pickText(item.guid);
            if (!title || !link) continue;
            const canonical = canonicalizeUrl(link);
            const author = pickText(item['dc:creator']) ?? pickText(item.author) ?? feed.publisher;
            out.push({
              kind: 'RSS',
              externalId: pickText(item.guid) ?? canonical,
              url: canonical,
              urlHash: urlHash(canonical),
              title: title.slice(0, 500),
              author,
              publishedAt: pickDate(item.pubDate, item.published, item.updated),
              category,
              language: 'en',
              payload: {
                publisher: feed.publisher,
                feedUrl: feed.url,
                summary: (pickText(item.description) ?? pickText(item.summary) ?? '').slice(0, 500),
              },
            });
          }
        } catch {
          continue;
        }
      }
      return out;
    },
  };
}

export const rssAdapter = buildRssAdapter();
