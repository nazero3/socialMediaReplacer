import { dailySlug, readingTimeSeconds } from '@smr/content';
import { CATEGORIES, type Category } from '@smr/types';
import { prisma } from '../db';
import { getLlmClient } from '../llm/index';
import type { DigestSource } from '../llm/index';
import { logger } from '../logger';

const SOURCES_PER_DIGEST = 10;

function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export interface DigestSummary {
  category: Category;
  status: 'CREATED' | 'SKIPPED' | 'FAILED';
  articleId?: string;
  error?: string;
}

export async function runDigestForDate(target = new Date()): Promise<DigestSummary[]> {
  const runDate = startOfUtcDay(target);
  const llm = getLlmClient();
  const summaries: DigestSummary[] = [];
  for (const category of CATEGORIES) {
    summaries.push(await runOneDigest(category, runDate, llm));
  }
  return summaries;
}

async function runOneDigest(
  category: Category,
  runDate: Date,
  llm: ReturnType<typeof getLlmClient>,
): Promise<DigestSummary> {
  let runId: string;
  try {
    const created = await prisma.digestRun.create({
      data: { runDate, category, status: 'RUNNING' },
    });
    runId = created.id;
  } catch {
    logger.info({ category, runDate }, 'digest: already attempted today, skipping');
    return { category, status: 'SKIPPED' };
  }

  try {
    const dayAgo = new Date(runDate.getTime() - 24 * 60 * 60 * 1000);
    const sources = await prisma.source.findMany({
      where: {
        category,
        OR: [{ fetchedAt: { gte: dayAgo } }, { publishedAt: { gte: dayAgo } }],
      },
      orderBy: [{ publishedAt: 'desc' }, { fetchedAt: 'desc' }],
      take: SOURCES_PER_DIGEST,
    });
    if (sources.length < 3) {
      throw new Error(`Not enough sources for ${category} (${sources.length})`);
    }

    const llmSources: DigestSource[] = sources.map((s) => ({
      kind: s.kind,
      externalId: s.externalId,
      url: s.url,
      urlHash: s.urlHash,
      title: s.title,
      author: s.author,
      publishedAt: s.publishedAt,
      category,
      payload: (s.payload as Record<string, unknown>) ?? {},
      language: s.language,
      publisher:
        ((s.payload as Record<string, unknown> | null)?.publisher as string | undefined) ?? null,
      preview:
        ((s.payload as Record<string, unknown> | null)?.summary as string | undefined) ??
        ((s.payload as Record<string, unknown> | null)?.selftextPreview as string | undefined) ??
        ((s.payload as Record<string, unknown> | null)?.textPreview as string | undefined) ??
        null,
    }));

    const result = await llm.generateDigest({
      category,
      date: runDate.toISOString(),
      sources: llmSources,
    });

    const slug = dailySlug(category, runDate.toISOString(), result.title);

    const article = await prisma.article.create({
      data: {
        slug,
        title: result.title.slice(0, 200),
        summary: result.summary.slice(0, 600),
        bodyMarkdown: result.bodyMarkdown,
        category,
        kind: 'DIGEST',
        status: 'PUBLISHED',
        publishedAt: runDate,
        readingTimeSec: readingTimeSeconds(result.bodyMarkdown),
        sources: {
          create: result.citations.map((idx, position) => {
            const src = sources[idx];
            if (!src) throw new Error(`Citation index ${idx} out of range`);
            return { sourceId: src.id, position };
          }),
        },
      },
    });

    await prisma.digestRun.update({
      where: { id: runId },
      data: { status: 'SUCCEEDED', articleId: article.id },
    });
    logger.info({ category, articleId: article.id, slug }, 'digest: created');
    return { category, status: 'CREATED', articleId: article.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await prisma.digestRun.update({
      where: { id: runId },
      data: { status: 'FAILED', error: msg },
    });
    logger.error({ category, err: msg }, 'digest: failed');
    return { category, status: 'FAILED', error: msg };
  }
}
