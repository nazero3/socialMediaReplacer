export * from './types';
export * from './reddit';
export * from './hn';
export * from './wiki';
export * from './rss';
export * from './http';

import type { SourceAdapter } from './types';
import { redditAdapter } from './reddit';
import { hnAdapter } from './hn';
import { wikiAdapter } from './wiki';
import { rssAdapter } from './rss';

export const allAdapters: SourceAdapter[] = [redditAdapter, hnAdapter, wikiAdapter, rssAdapter];
