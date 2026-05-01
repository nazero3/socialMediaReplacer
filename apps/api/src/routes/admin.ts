import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import type { FastifyInstance } from 'fastify';
import { requireAdmin } from '../auth.js';
import { prisma } from '../db.js';
import { env } from '../env.js';

let ingestQueue: Queue | null = null;
function getIngestQueue(): Queue {
  if (!ingestQueue) {
    const conn = new IORedis(env.redisUrl, { maxRetriesPerRequest: null });
    ingestQueue = new Queue('ingest', { connection: conn });
  }
  return ingestQueue;
}

export async function adminRoutes(app: FastifyInstance): Promise<void> {
  app.post('/admin/reingest', { preHandler: requireAdmin }, async (_req, reply) => {
    try {
      await getIngestQueue().add('ingest', {}, { attempts: 3, backoff: { type: 'exponential', delay: 60_000 } });
      reply.code(202);
      return { status: 'queued' };
    } catch (err) {
      reply.code(503);
      return { error: 'Could not enqueue', detail: err instanceof Error ? err.message : String(err) };
    }
  });

  app.post('/admin/articles/:id/hide', { preHandler: requireAdmin }, async (req, reply) => {
    const { id } = req.params as { id: string };
    try {
      const updated = await prisma.article.update({
        where: { id },
        data: { status: 'HIDDEN' },
      });
      return { id: updated.id, status: updated.status };
    } catch {
      reply.code(404);
      return { error: 'Article not found' };
    }
  });

  app.post('/admin/articles/:id/unhide', { preHandler: requireAdmin }, async (req, reply) => {
    const { id } = req.params as { id: string };
    try {
      const updated = await prisma.article.update({
        where: { id },
        data: { status: 'PUBLISHED' },
      });
      return { id: updated.id, status: updated.status };
    } catch {
      reply.code(404);
      return { error: 'Article not found' };
    }
  });
}
