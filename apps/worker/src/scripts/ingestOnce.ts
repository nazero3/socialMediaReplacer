import { runIngest } from '../jobs/ingest.js';
import { logger } from '../logger.js';

runIngest()
  .then((summary) => {
    logger.info({ summary }, 'ingest: complete');
    process.exit(0);
  })
  .catch((err) => {
    logger.error({ err: err instanceof Error ? err.message : String(err) }, 'ingest: failed');
    process.exit(1);
  });
