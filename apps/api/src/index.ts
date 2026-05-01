import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import Fastify from 'fastify';
import { env } from './env.js';
import { prisma } from './db.js';
import { articlesRoutes } from './routes/articles.js';
import { feedRoutes } from './routes/feed.js';
import { adminRoutes } from './routes/admin.js';

async function build() {
  const app = Fastify({
    logger: {
      level: env.logLevel,
      transport:
        process.env.NODE_ENV === 'production'
          ? undefined
          : { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss' } },
    },
    disableRequestLogging: false,
    trustProxy: true,
  });

  await app.register(cors, { origin: true });
  await app.register(rateLimit, {
    max: 240,
    timeWindow: '1 minute',
    allowList: () => false,
  });

  app.get('/healthz', async () => {
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true };
  });

  await app.register(articlesRoutes);
  await app.register(feedRoutes);
  await app.register(adminRoutes);

  return app;
}

const isDirectRun =
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith('apps/api/src/index.ts') ||
  process.argv[1]?.endsWith('apps/api/dist/index.js');

if (isDirectRun) {
  build()
    .then(async (app) => {
      try {
        await app.listen({ port: env.port, host: '0.0.0.0' });
        app.log.info(`API listening on :${env.port}`);
      } catch (err) {
        app.log.error(err);
        process.exit(1);
      }
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

export { build };
