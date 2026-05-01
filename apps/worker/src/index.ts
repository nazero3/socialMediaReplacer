import { buildConnection, setupSchedulers, startWorkers } from './queues.js';
import { logger } from './logger.js';

async function main() {
  const connection = buildConnection();
  await setupSchedulers(connection);
  const { close } = startWorkers(connection);
  logger.info('worker: schedulers + workers up');

  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'worker: shutting down');
    await close();
    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

main().catch((err) => {
  logger.error({ err: err instanceof Error ? err.message : String(err) }, 'worker: fatal');
  process.exit(1);
});
