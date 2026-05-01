const WORDS_PER_MINUTE = 220;

export function countWords(markdown: string): number {
  if (!markdown) return 0;
  const stripped = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/[#>*_~`-]/g, ' ');
  return stripped.split(/\s+/).filter(Boolean).length;
}

export function readingTimeSeconds(markdown: string): number {
  const words = countWords(markdown);
  return Math.max(30, Math.round((words / WORDS_PER_MINUTE) * 60));
}

export function formatReadingTime(seconds: number): string {
  const minutes = Math.max(1, Math.round(seconds / 60));
  return `${minutes} min read`;
}
