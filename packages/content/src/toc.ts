import { slugify } from './slug';

export interface TocEntry {
  id: string;
  text: string;
  level: 2 | 3;
}

export function extractToc(markdown: string): TocEntry[] {
  const out: TocEntry[] = [];
  const lines = markdown.split('\n');
  let inFence = false;
  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = /^(#{2,3})\s+(.+?)\s*#*$/.exec(line);
    if (!m) continue;
    const level = m[1]!.length === 2 ? 2 : 3;
    const text = m[2]!.trim();
    out.push({ id: slugify(text), text, level });
  }
  return out;
}
