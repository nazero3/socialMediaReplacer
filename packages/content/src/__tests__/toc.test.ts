import { describe, expect, it } from 'vitest';
import { extractToc } from '../toc.js';
import { readingTimeSeconds } from '../readingTime.js';

describe('extractToc', () => {
  it('captures H2 and H3 outside code fences', () => {
    const md = [
      '# Title',
      '',
      '## First',
      'body',
      '',
      '```',
      '## Not a heading',
      '```',
      '',
      '### Sub one',
      '## Second',
    ].join('\n');
    const toc = extractToc(md);
    expect(toc.map((t) => t.text)).toEqual(['First', 'Sub one', 'Second']);
    expect(toc.every((t) => t.level === 2 || t.level === 3)).toBe(true);
  });
});

describe('readingTimeSeconds', () => {
  it('returns at least 30 seconds even for short text', () => {
    expect(readingTimeSeconds('hi')).toBeGreaterThanOrEqual(30);
  });
  it('grows with length', () => {
    const long = Array(500).fill('word').join(' ');
    expect(readingTimeSeconds(long)).toBeGreaterThan(readingTimeSeconds('short'));
  });
});
