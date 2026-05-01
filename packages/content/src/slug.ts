export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

export function dailySlug(category: string, isoDate: string, title: string): string {
  const datePart = isoDate.slice(0, 10);
  const titlePart = slugify(title) || 'daily-digest';
  return `${category}-${datePart}-${titlePart}`.slice(0, 120);
}
