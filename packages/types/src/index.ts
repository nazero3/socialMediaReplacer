export const CATEGORIES = ['tech', 'news', 'diy', 'til'] as const;
export type Category = (typeof CATEGORIES)[number];

export const SOURCE_KINDS = ['REDDIT', 'HN', 'WIKI', 'RSS'] as const;
export type SourceKind = (typeof SOURCE_KINDS)[number];

export const ARTICLE_STATUSES = ['DRAFT', 'PUBLISHED', 'HIDDEN'] as const;
export type ArticleStatus = (typeof ARTICLE_STATUSES)[number];

export const ARTICLE_KINDS = ['DIGEST', 'FEATURE'] as const;
export type ArticleKind = (typeof ARTICLE_KINDS)[number];

export const DIGEST_STATUSES = ['RUNNING', 'SUCCEEDED', 'FAILED'] as const;
export type DigestStatus = (typeof DIGEST_STATUSES)[number];

export interface SourceCitation {
  id: string;
  url: string;
  title: string;
  author: string | null;
  publishedAt: string | null;
  kind: SourceKind;
  position: number;
}

export interface ArticleSummary {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: Category;
  kind: ArticleKind;
  readingTimeSec: number;
  publishedAt: string;
  heroImageUrl: string | null;
}

export interface ArticleDetail extends ArticleSummary {
  bodyMarkdown: string;
  updatedAt: string;
  sources: SourceCitation[];
  tags: { slug: string; name: string }[];
}

export interface PaginatedArticles {
  items: ArticleSummary[];
  page: number;
  limit: number;
  total: number;
}

export interface NormalizedSource {
  kind: SourceKind;
  externalId: string;
  url: string;
  urlHash: string;
  title: string;
  author: string | null;
  publishedAt: Date | null;
  category: Category;
  payload: Record<string, unknown>;
  language: string;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  tech: 'Tech',
  news: 'News',
  diy: 'DIY',
  til: 'Today I Learned',
};

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}
