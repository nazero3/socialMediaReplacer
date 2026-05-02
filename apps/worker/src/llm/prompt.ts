import { CATEGORY_LABELS } from '@smr/types';
import type { DigestRequest } from './types';

const SYSTEM = `You are the editor of a calm, reader-first daily digest.
Your audience has chosen to read here instead of scrolling social media.
You write documentary-style articles in a measured, considered voice.

Strict rules:
- Do NOT reproduce upstream article bodies verbatim. Paraphrase.
- Always treat the listed sources as the only factual evidence.
- Cite at least 3 sources by their numeric index in a "citations" array.
- Markdown body only. Use ## subheads (2-4 of them). Plain text. No HTML.
- Keep total length 600-900 words. Do not list raw URLs in the body — citations array handles that.
- Output strict JSON matching: { "title": string, "summary": string, "bodyMarkdown": string, "citations": number[] }
- Title <= 80 chars. Summary 2 sentences. Bias toward calm, plain English.`;

export function buildPrompt(req: DigestRequest): { system: string; user: string } {
  const list = req.sources
    .map((s, i) => {
      const author = s.author ? ` — ${s.author}` : '';
      const preview = s.preview ? `\n   ${s.preview.replace(/\s+/g, ' ').slice(0, 280)}` : '';
      return `[${i}] ${s.title}${author}\n   url: ${s.url}${preview}`;
    })
    .join('\n');
  const user = `Date: ${req.date}
Category: ${CATEGORY_LABELS[req.category]}

Sources (numeric indices are stable; cite at least 3 of them):
${list}

Write today's documentary-style digest.`;
  return { system: SYSTEM, user };
}
