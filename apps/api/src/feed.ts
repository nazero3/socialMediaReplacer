import type { ArticleSummary } from '@smr/types';

function escapeXml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export interface FeedOptions {
  siteUrl: string;
  selfUrl: string;
  title: string;
  subtitle: string;
}

export function renderAtomFeed(articles: ArticleSummary[], opts: FeedOptions): string {
  const updated = (articles[0]?.publishedAt ?? new Date().toISOString()).toString();
  const entries = articles
    .map((a) => {
      const articleUrl = `${opts.siteUrl}/article/${a.slug}`;
      return [
        '  <entry>',
        `    <id>${escapeXml(articleUrl)}</id>`,
        `    <title>${escapeXml(a.title)}</title>`,
        `    <link href="${escapeXml(articleUrl)}"/>`,
        `    <updated>${escapeXml(a.publishedAt)}</updated>`,
        `    <category term="${escapeXml(a.category)}"/>`,
        `    <summary>${escapeXml(a.summary)}</summary>`,
        '  </entry>',
      ].join('\n');
    })
    .join('\n');
  return [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<feed xmlns="http://www.w3.org/2005/Atom">',
    `  <title>${escapeXml(opts.title)}</title>`,
    `  <subtitle>${escapeXml(opts.subtitle)}</subtitle>`,
    `  <id>${escapeXml(opts.siteUrl)}</id>`,
    `  <link rel="self" href="${escapeXml(opts.selfUrl)}"/>`,
    `  <link href="${escapeXml(opts.siteUrl)}"/>`,
    `  <updated>${escapeXml(updated)}</updated>`,
    entries,
    '</feed>',
  ].join('\n');
}
