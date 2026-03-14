import cron from 'node-cron';
import { createApp } from './app.js';
import { env } from './shared/config/env.js';
import { createSystemContext } from './shared/context/request-context.js';
import { logger } from './shared/utils/logger.js';
import { ingestionService } from './modules/ingestion/services/ingestion.service.js';

const app = createApp();

if (env.nodeEnv !== 'test') {
  cron.schedule(env.ingestionCron, async () => {
    const systemContext = createSystemContext();

    try {
      await ingestionService.trigger(systemContext, { triggeredBy: 'scheduler' });
    } catch (error) {
      logger.error('Ingestion cron failed', { ...systemContext, error });
    }
  });

  app.listen(env.port, () => {
    logger.info('LedgerAxis backend listening', { port: env.port });
  });
}

export default app;
