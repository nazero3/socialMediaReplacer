import { describe, expect, it } from 'vitest';
import type { ArticleSummary } from '@smr/types';
import { renderAtomFeed } from '../feed.js';

const sample: ArticleSummary[] = [
  {
    id: '1',
    slug: 'today',
    title: 'A calm Tuesday',
    summary: 'Short, considered, finite.',
    category: 'til',
    kind: 'DIGEST',
    readingTimeSec: 240,
    publishedAt: '2026-05-01T06:00:00.000Z',
    heroImageUrl: null,
  },
];

describe('renderAtomFeed', () => {
  it('produces valid Atom XML with self link and entries', () => {
    const xml = renderAtomFeed(sample, {
      siteUrl: 'https://example.com',
      selfUrl: 'https://example.com/feed.xml',
      title: 'Test',
      subtitle: 'Sub',
    });
    expect(xml).toContain('<?xml version="1.0" encoding="utf-8"?>');
    expect(xml).toContain('<feed xmlns="http://www.w3.org/2005/Atom">');
    expect(xml).toContain('<link rel="self" href="https://example.com/feed.xml"/>');
    expect(xml).toContain('<title>A calm Tuesday</title>');
    expect(xml).toContain('https://example.com/article/today');
  });

  it('escapes XML special characters', () => {
    const xml = renderAtomFeed(
      [{ ...sample[0]!, title: 'A & <b>B</b>' }],
      { siteUrl: 'https://x', selfUrl: 'https://x/f', title: 't', subtitle: 's' },
    );
    expect(xml).toContain('A &amp; &lt;b&gt;B&lt;/b&gt;');
  });
});
