import type { ArticleDetail, ArticleSummary, PaginatedArticles } from '@smr/types';

const now = new Date().toISOString();

export const MOCK_ARTICLES: ArticleDetail[] = [
  {
    id: 'm1',
    slug: 'tech-quiet-ai-tools-2026',
    title: 'Quiet AI Tools Worth Reading This Week',
    summary: 'A calm, practical scan of AI tools that save time without adding noise.',
    category: 'tech',
    kind: 'FEATURE',
    readingTimeSec: 360,
    publishedAt: now,
    heroImageUrl: null,
    bodyMarkdown:
      '## What changed\n\nA lot of AI products now optimize for focus instead of speed-only.\n\n## What to use\n\nChoose tools that export plain files, work offline when possible, and avoid lock-in.\n\n## Bottom line\n\nA good tool should reduce context switching, not increase it.',
    updatedAt: now,
    sources: [
      {
        id: 's1',
        url: 'https://news.ycombinator.com/',
        title: 'Hacker News',
        author: null,
        publishedAt: null,
        kind: 'HN',
        position: 0,
      },
    ],
    tags: [{ slug: 'ai', name: 'AI' }],
  },
  {
    id: 'm2',
    slug: 'news-one-hour-news-diet',
    title: 'The One-Hour News Diet',
    summary: 'How to stay informed without scrolling all day.',
    category: 'news',
    kind: 'FEATURE',
    readingTimeSec: 300,
    publishedAt: now,
    heroImageUrl: null,
    bodyMarkdown:
      '## Less is better\n\nUse one global source and one local source.\n\n## Timing\n\nRead at fixed times; avoid alerts.\n\n## Result\n\nBetter retention, lower stress.',
    updatedAt: now,
    sources: [
      {
        id: 's2',
        url: 'https://www.bbc.com/news',
        title: 'BBC News',
        author: null,
        publishedAt: null,
        kind: 'RSS',
        position: 0,
      },
    ],
    tags: [{ slug: 'news-diet', name: 'News diet' }],
  },
  {
    id: 'm3',
    slug: 'diy-evening-reading-lamp',
    title: 'Build a Better Evening Reading Lamp',
    summary: 'A simple DIY upgrade for a warmer, eye-friendly reading setup.',
    category: 'diy',
    kind: 'FEATURE',
    readingTimeSec: 240,
    publishedAt: now,
    heroImageUrl: null,
    bodyMarkdown:
      '## Parts\n\nWarm bulb, diffuser paper, stable lamp base.\n\n## Setup\n\nUse 2700K-3000K color temperature and indirect light.\n\n## Why it works\n\nComfortable contrast helps long reading sessions.',
    updatedAt: now,
    sources: [],
    tags: [{ slug: 'lighting', name: 'Lighting' }],
  },
  {
    id: 'm4',
    slug: 'til-how-rss-still-wins',
    title: 'TIL: Why RSS Still Wins',
    summary: 'A quick explainer on why RSS is still one of the cleanest reading systems.',
    category: 'til',
    kind: 'FEATURE',
    readingTimeSec: 210,
    publishedAt: now,
    heroImageUrl: null,
    bodyMarkdown:
      '## Predictable input\n\nRSS delivers updates without algorithmic ranking.\n\n## Ownership\n\nYou control your reader and your feed list.\n\n## Practical tip\n\nStart with 5 trusted sources, not 50.',
    updatedAt: now,
    sources: [],
    tags: [{ slug: 'rss', name: 'RSS' }],
  },
];

export function listMockArticles(params: {
  category?: string;
  page?: number;
  limit?: number;
}): PaginatedArticles {
  const page = Math.max(1, Number(params.page ?? 1));
  const limit = Math.max(1, Number(params.limit ?? 20));
  const filtered = params.category
    ? MOCK_ARTICLES.filter((a) => a.category === params.category)
    : MOCK_ARTICLES;
  const start = (page - 1) * limit;
  const items = filtered.slice(start, start + limit).map(toSummary);
  return { items, page, limit, total: filtered.length };
}

export function getMockArticleBySlug(slug: string): ArticleDetail | null {
  return MOCK_ARTICLES.find((a) => a.slug === slug) ?? null;
}

export function searchMockArticles(q: string): ArticleSummary[] {
  const t = q.trim().toLowerCase();
  if (t.length < 2) return [];
  return MOCK_ARTICLES.filter(
    (a) => a.title.toLowerCase().includes(t) || a.summary.toLowerCase().includes(t),
  ).map(toSummary);
}

function toSummary(a: ArticleDetail): ArticleSummary {
  return {
    id: a.id,
    slug: a.slug,
    title: a.title,
    summary: a.summary,
    category: a.category,
    kind: a.kind,
    readingTimeSec: a.readingTimeSec,
    publishedAt: a.publishedAt,
    heroImageUrl: a.heroImageUrl,
  };
}
