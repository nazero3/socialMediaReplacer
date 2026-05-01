import { env } from '../env.js';
import { buildPrompt } from './prompt.js';
import type { DigestRequest, DigestResult, LlmClient } from './types.js';

export const openaiClient: LlmClient = {
  name: 'openai',
  async generateDigest(req: DigestRequest): Promise<DigestResult> {
    if (!env.openaiKey) throw new Error('OPENAI_API_KEY is not set');
    const { system, user } = buildPrompt(req);
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: env.openaiModel,
        temperature: 0.5,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`OpenAI error ${res.status}: ${text.slice(0, 500)}`);
    }
    const json = (await res.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    const raw = json.choices[0]?.message.content ?? '{}';
    return parseDigest(raw, req.sources.length);
  },
};

export function parseDigest(raw: string, sourceCount: number): DigestResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('LLM returned non-JSON content');
  }
  if (!parsed || typeof parsed !== 'object') throw new Error('LLM JSON not an object');
  const obj = parsed as Record<string, unknown>;
  const title = String(obj.title ?? '').trim();
  const summary = String(obj.summary ?? '').trim();
  const bodyMarkdown = String(obj.bodyMarkdown ?? '').trim();
  const citationsRaw = Array.isArray(obj.citations) ? obj.citations : [];
  const citations = citationsRaw
    .map((n) => Number(n))
    .filter((n) => Number.isInteger(n) && n >= 0 && n < sourceCount);
  if (!title || !summary || !bodyMarkdown) throw new Error('LLM response missing required fields');
  if (citations.length < 3) throw new Error('LLM response must cite at least 3 sources');
  return { title, summary, bodyMarkdown, citations };
}
