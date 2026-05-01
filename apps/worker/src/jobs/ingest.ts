import { allAdapters, type SourceAdapter } from '@smr/ingest';
import { CATEGORIES, type Category } from '@smr/types';
import { prisma } from '../db.js';
import { env } from '../env.js';
import { logger } from '../logger.js';

export interface IngestSummary {
  sourceKind: SourceAdapter['kind'];
  category: Category;
  fetched: number;
  inserted: number;
  error?: string;
}

export async function runIngest(): Promise<IngestSummary[]> {
  const summaries: IngestSummary[] = [];
  for (const adapter of allAdapters) {
    const run = await prisma.ingestRun.create({
      data: { sourceKind: adapter.kind },
    });
    let fetchedTotal = 0;
    let insertedTotal = 0;
    let runError: string | undefined;
    try {
      for (const category of CATEGORIES) {
        const sources = await adapter
          .fetchForCategory(
            { category, limit: env.ingestLimitPerSource },
            { userAgent: env.redditUserAgent, fetchTimeoutMs: 15_000 },
          )
          .catch((e) => {
            logger.warn({ adapter: adapter.kind, category, err: String(e) }, 'adapter failed for category');
            return [];
          });
        let inserted = 0;
        for (const s of sources) {
          const before = await prisma.source.findUnique({ where: { urlHash: s.urlHash } });
          await prisma.source.upsert({
            where: { urlHash: s.urlHash },
            update: { fetchedAt: new Date() },
            create: {
              kind: s.kind,
              externalId: s.externalId,
              url: s.url,
              urlHash: s.urlHash,
              title: s.title,
              author: s.author ?? undefined,
              publishedAt: s.publishedAt ?? undefined,
              category: s.category,
              language: s.language,
              payload: s.payload,
            },
          });
          if (!before) inserted += 1;
        }
        fetchedTotal += sources.length;
        insertedTotal += inserted;
        summaries.push({
          sourceKind: adapter.kind,
          category,
          fetched: sources.length,
          inserted,
        });
        logger.info(
          { adapter: adapter.kind, category, fetched: sources.length, inserted },
          'ingest: category complete',
        );
      }
    } catch (err) {
      runError = err instanceof Error ? err.message : String(err);
      logger.error({ adapter: adapter.kind, err: runError }, 'ingest run failed');
    } finally {
      await prisma.ingestRun.update({
        where: { id: run.id },
        data: {
          finishedAt: new Date(),
          itemsFetched: fetchedTotal,
          itemsNew: insertedTotal,
          error: runError,
        },
      });
    }
  }
  return summaries;
}
