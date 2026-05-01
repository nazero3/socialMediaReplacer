import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadDotEnv(): void {
  const candidates = [resolve(process.cwd(), '.env'), resolve(process.cwd(), '../../.env')];
  for (const file of candidates) {
    if (!existsSync(file)) continue;
    const raw = readFileSync(file, 'utf8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  }
}

loadDotEnv();

function required(name: string): string {
  const v = process.env[name];
  if (!v || v.length === 0) throw new Error(`Missing required env var ${name}`);
  return v;
}
function optional(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

export const env = {
  databaseUrl: required('DATABASE_URL'),
  redisUrl: optional('REDIS_URL', 'redis://localhost:6379'),
  ingestCron: optional('INGEST_CRON', '0 */6 * * *'),
  digestCron: optional('DIGEST_CRON', '0 6 * * *'),
  ingestLimitPerSource: Number(optional('INGEST_LIMIT_PER_SOURCE', '20')),
  redditUserAgent: optional(
    'REDDIT_USER_AGENT',
    'socialMediaReplacer/0.1 (+https://example.com)',
  ),
  llmProvider: optional('LLM_PROVIDER', 'openai'),
  openaiKey: process.env.OPENAI_API_KEY ?? '',
  openaiModel: optional('OPENAI_MODEL', 'gpt-4o-mini'),
  anthropicKey: process.env.ANTHROPIC_API_KEY ?? '',
  ollamaUrl: optional('OLLAMA_URL', 'http://localhost:11434'),
  logLevel: optional('LOG_LEVEL', 'info'),
};
