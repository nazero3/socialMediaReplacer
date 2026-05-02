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

function normalizeConnectionEnvVar(name: 'DATABASE_URL' | 'REDIS_URL'): void {
  const raw = process.env[name];
  if (!raw) return;

  let v = raw.trim();
  v = v.replace(/^\uFEFF/, '');

  const prefixed = new RegExp(`^${name}=`, 'i');
  if (prefixed.test(v)) v = v.replace(prefixed, '');

  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1).trim();
  }

  process.env[name] = v;
}

normalizeConnectionEnvVar('DATABASE_URL');
normalizeConnectionEnvVar('REDIS_URL');

function required(name: string): string {
  const v = process.env[name];
  if (!v || v.length === 0) {
    throw new Error(`Missing required env var ${name}`);
  }
  return v;
}

function optional(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

export const env = {
  databaseUrl: required('DATABASE_URL'),
  redisUrl: optional('REDIS_URL', 'redis://localhost:6379'),
  // Render/Heroku-style hosts inject PORT. Locally we use API_PORT (default 4000).
  port: Number(process.env.PORT ?? optional('API_PORT', '4000')),
  publicUrl: optional(
    'API_PUBLIC_URL',
    optional('RENDER_EXTERNAL_URL', 'http://localhost:4000'),
  ),
  siteUrl: optional('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000'),
  adminToken: optional('ADMIN_TOKEN', ''),
  logLevel: optional('LOG_LEVEL', 'info'),
};
