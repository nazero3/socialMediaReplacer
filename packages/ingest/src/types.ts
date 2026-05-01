import type { Category, NormalizedSource } from '@smr/types';

export interface AdapterContext {
  userAgent: string;
  fetchTimeoutMs?: number;
  limit?: number;
}

export interface CategoryFetchOptions {
  category: Category;
  limit?: number;
}

export interface SourceAdapter {
  readonly kind: NormalizedSource['kind'];
  fetchForCategory(opts: CategoryFetchOptions, ctx: AdapterContext): Promise<NormalizedSource[]>;
}
