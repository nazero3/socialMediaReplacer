import { describe, expect, it } from 'vitest';
import { canonicalizeUrl, urlHash } from '../canonical';

describe('canonicalizeUrl', () => {
  it('strips tracking params and fragments', () => {
    const a = canonicalizeUrl('https://Example.com/Path/?utm_source=x&id=42#frag');
    expect(a).toBe('https://example.com/Path?id=42');
  });

  it('drops default ports and trailing slash', () => {
    expect(canonicalizeUrl('https://example.com:443/foo/')).toBe('https://example.com/foo');
  });

  it('keeps query order stable by sorting', () => {
    const a = canonicalizeUrl('https://x.com/a?b=2&a=1');
    const b = canonicalizeUrl('https://x.com/a?a=1&b=2');
    expect(a).toBe(b);
  });
});

describe('urlHash', () => {
  it('hashes equivalent URLs to the same digest', () => {
    expect(urlHash('https://x.com/a/?utm_source=x')).toBe(urlHash('https://x.com/a'));
  });
});
