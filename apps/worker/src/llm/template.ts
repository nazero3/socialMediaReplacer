import { CATEGORY_LABELS } from '@smr/types';
import type { DigestRequest, DigestResult, LlmClient } from './types';

/**
 * Deterministic, no-network fallback used when no LLM provider is configured.
 * Produces a readable digest from the source list directly. Useful in dev
 * and as a graceful degradation path.
 */
export const templateClient: LlmClient = {
  name: 'template',
  async generateDigest(req: DigestRequest): Promise<DigestResult> {
    const top = req.sources.slice(0, Math.min(8, req.sources.length));
    const label = CATEGORY_LABELS[req.category];
    const today = new Date(req.date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const title = `${label} — what was worth reading on ${today}`;
    const summary = `A short, calm digest of ${top.length} stories worth reading from today. Take your time; nothing here is going anywhere.`;
    const intro = `## Today, in brief\n\nWe collected ${top.length} stories across our ${label} sources. Each item below is a paraphrase with a link back to the original. Read what interests you, skip what doesn't, and close the tab when you're done.`;
    const items = top
      .map((s, i) => {
        const author = s.author ? `, by ${s.author}` : '';
        const preview = s.preview ? `\n\n${s.preview.replace(/\s+/g, ' ').slice(0, 280)}` : '';
        return `## ${i + 1}. ${s.title}\n\nFrom **${s.publisher ?? s.kind}**${author}.${preview}`;
      })
      .join('\n\n');
    const outro = `## Notes for the reader\n\nThis was assembled from public sources, paraphrased, and credited. Follow the source links for the full pieces. We'll be back tomorrow with the next one.`;
    const bodyMarkdown = [intro, items, outro].join('\n\n');
    return {
      title,
      summary,
      bodyMarkdown,
      citations: top.map((_, i) => i),
    };
  },
};
