import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ArticleDetail, ArticleSummary } from '@smr/types';

const BOOKMARK_KEY = 'smr/bookmarks';
const HISTORY_KEY = 'smr/history';
const CACHE_PREFIX = 'smr/cache/';
const MAX_HISTORY = 100;
const MAX_CACHE = 50;

export async function getBookmarks(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(BOOKMARK_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

export async function setBookmark(slug: string, on: boolean): Promise<string[]> {
  const list = await getBookmarks();
  const next = on ? Array.from(new Set([slug, ...list])) : list.filter((s) => s !== slug);
  await AsyncStorage.setItem(BOOKMARK_KEY, JSON.stringify(next));
  return next;
}

export async function isBookmarked(slug: string): Promise<boolean> {
  const list = await getBookmarks();
  return list.includes(slug);
}

export async function pushHistory(item: ArticleSummary): Promise<void> {
  const raw = await AsyncStorage.getItem(HISTORY_KEY);
  let list: ArticleSummary[] = [];
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) list = parsed as ArticleSummary[];
    } catch {
      list = [];
    }
  }
  const dedup = [item, ...list.filter((a) => a.slug !== item.slug)].slice(0, MAX_HISTORY);
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(dedup));
}

export async function getHistory(): Promise<ArticleSummary[]> {
  const raw = await AsyncStorage.getItem(HISTORY_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ArticleSummary[]) : [];
  } catch {
    return [];
  }
}

export async function cacheArticle(article: ArticleDetail): Promise<void> {
  await AsyncStorage.setItem(`${CACHE_PREFIX}${article.slug}`, JSON.stringify(article));
  // Trim cache to MAX_CACHE most-recent.
  const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(CACHE_PREFIX));
  if (keys.length > MAX_CACHE) {
    const overflow = keys.slice(0, keys.length - MAX_CACHE);
    await AsyncStorage.multiRemove(overflow);
  }
}

export async function getCachedArticle(slug: string): Promise<ArticleDetail | null> {
  const raw = await AsyncStorage.getItem(`${CACHE_PREFIX}${slug}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ArticleDetail;
  } catch {
    return null;
  }
}
