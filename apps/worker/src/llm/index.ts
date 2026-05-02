import { env } from '../env';
import { openaiClient } from './openai';
import { templateClient } from './template';
import type { LlmClient } from './types';

export function getLlmClient(): LlmClient {
  const provider = env.llmProvider.toLowerCase();
  if (provider === 'openai' && env.openaiKey) return openaiClient;
  if (provider === 'template' || !env.openaiKey) return templateClient;
  return templateClient;
}

export type { LlmClient, DigestRequest, DigestResult, DigestSource } from './types';
