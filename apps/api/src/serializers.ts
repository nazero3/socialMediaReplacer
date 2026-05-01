import type { ArticleDetail, ArticleSummary, SourceCitation } from '@smr/types';

interface ArticleRowSummary {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  kind: string;
  readingTimeSec: number;
  publishedAt: Date;
  heroImageUrl: string | null;
}

interface ArticleRowDetail extends ArticleRowSummary {
  bodyMarkdown: string;
  updatedAt: Date;
  sources: Array<{
    position: number;
    source: {
      id: string;
      url: string;
      title: string;
      author: string | null;
      publishedAt: Date | null;
      kind: string;
    };
  }>;
  tags: Array<{ tag: { slug: string; name: string } }>;
}

export function toArticleSummary(row: ArticleRowSummary): ArticleSummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    category: row.category as ArticleSummary['category'],
    kind: row.kind as ArticleSummary['kind'],
    readingTimeSec: row.readingTimeSec,
    publishedAt: row.publishedAt.toISOString(),
    heroImageUrl: row.heroImageUrl,
  };
}

export function toArticleDetail(row: ArticleRowDetail): ArticleDetail {
  const sources: SourceCitation[] = row.sources
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((cs) => ({
      id: cs.source.id,
      url: cs.source.url,
      title: cs.source.title,
      author: cs.source.author,
      publishedAt: cs.source.publishedAt ? cs.source.publishedAt.toISOString() : null,
      kind: cs.source.kind as SourceCitation['kind'],
      position: cs.position,
    }));

  return {
    ...toArticleSummary(row),
    bodyMarkdown: row.bodyMarkdown,
    updatedAt: row.updatedAt.toISOString(),
    sources,
    tags: row.tags.map(({ tag }) => ({ slug: tag.slug, name: tag.name })),
  };
}
