import { env } from '../env.js';
import { openaiClient } from './openai.js';
import { templateClient } from './template.js';
import type { LlmClient } from './types.js';

export function getLlmClient(): LlmClient {
  const provider = env.llmProvider.toLowerCase();
  if (provider === 'openai' && env.openaiKey) return openaiClient;
  if (provider === 'template' || !env.openaiKey) return templateClient;
  return templateClient;
}

export type { LlmClient, DigestRequest, DigestResult, DigestSource } from './types.js';
