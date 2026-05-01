import type { Category, NormalizedSource } from '@smr/types';

export interface DigestSource extends NormalizedSource {
  publisher?: string | null;
  preview?: string | null;
}

export interface DigestRequest {
  category: Category;
  date: string;
  sources: DigestSource[];
}

export interface DigestResult {
  title: string;
  summary: string;
  bodyMarkdown: string;
  citations: number[];
}

export interface LlmClient {
  readonly name: string;
  generateDigest(req: DigestRequest): Promise<DigestResult>;
}
