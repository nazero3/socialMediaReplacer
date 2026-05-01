import { Queue, Worker, type ConnectionOptions, type Job } from 'bullmq';
import IORedis from 'ioredis';
import { env } from './env.js';
import { runIngest } from './jobs/ingest.js';
import { runDigestForDate } from './jobs/digest.js';
import { logger } from './logger.js';

export const INGEST_QUEUE = 'ingest';
export const DIGEST_QUEUE = 'digest';

export function buildConnection(): ConnectionOptions {
  const conn = new IORedis(env.redisUrl, { maxRetriesPerRequest: null });
  return conn;
}

export interface JobMap {
  [INGEST_QUEUE]: Record<string, never>;
  [DIGEST_QUEUE]: { date?: string };
}

export async function setupSchedulers(connection: ConnectionOptions): Promise<{
  ingestQueue: Queue;
  digestQueue: Queue;
}> {
  const ingestQueue = new Queue(INGEST_QUEUE, { connection });
  const digestQueue = new Queue(DIGEST_QUEUE, { connection });

  await ingestQueue.upsertJobScheduler(
    'ingest-cron',
    { pattern: env.ingestCron },
    {
      name: 'ingest',
      data: {},
      opts: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 60_000 },
        removeOnComplete: 50,
        removeOnFail: 50,
      },
    },
  );

  await digestQueue.upsertJobScheduler(
    'digest-cron',
    { pattern: env.digestCron },
    {
      name: 'digest',
      data: {},
      opts: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 60_000 },
        removeOnComplete: 50,
        removeOnFail: 50,
      },
    },
  );

  return { ingestQueue, digestQueue };
}

export function startWorkers(connection: ConnectionOptions): { close: () => Promise<void> } {
  const ingestWorker = new Worker(
    INGEST_QUEUE,
    async (job: Job) => {
      logger.info({ jobId: job.id }, 'ingest: starting');
      const summary = await runIngest();
      return summary;
    },
    { connection, concurrency: 1 },
  );

  const digestWorker = new Worker(
    DIGEST_QUEUE,
    async (job: Job<{ date?: string }>) => {
      logger.info({ jobId: job.id }, 'digest: starting');
      const target = job.data?.date ? new Date(job.data.date) : new Date();
      const summary = await runDigestForDate(target);
      return summary;
    },
    { connection, concurrency: 1 },
  );

  for (const w of [ingestWorker, digestWorker]) {
    w.on('completed', (job) => logger.info({ jobId: job.id, queue: w.name }, 'job completed'));
    w.on('failed', (job, err) =>
      logger.error({ jobId: job?.id, queue: w.name, err: err?.message }, 'job failed'),
    );
  }

  return {
    close: async () => {
      await Promise.all([ingestWorker.close(), digestWorker.close()]);
    },
  };
}
