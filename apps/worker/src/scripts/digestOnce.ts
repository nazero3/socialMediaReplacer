import { runDigestForDate } from '../jobs/digest.js';
import { logger } from '../logger.js';

const arg = process.argv[2];
const target = arg ? new Date(arg) : new Date();

runDigestForDate(target)
  .then((summary) => {
    logger.info({ summary }, 'digest: complete');
    process.exit(0);
  })
  .catch((err) => {
    logger.error({ err: err instanceof Error ? err.message : String(err) }, 'digest: failed');
    process.exit(1);
  });
