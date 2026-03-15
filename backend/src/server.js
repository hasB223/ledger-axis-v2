import cron from 'node-cron';
import { createApp } from './app.js';
import { appEnv } from './shared/config/app-env.js';
import { createSystemContext } from './shared/context/request-context.js';
import { logger } from './shared/utils/logger.js';
import { ingestionService } from './modules/ingestion/services/ingestion.service.js';

const app = createApp();

if (appEnv.nodeEnv !== 'test') {
  cron.schedule(appEnv.ingestionCron, async () => {
    const systemContext = createSystemContext();

    try {
      await ingestionService.trigger(systemContext, { triggeredBy: 'scheduler' });
    } catch (error) {
      logger.error('Ingestion cron failed', { ...systemContext, error });
    }
  });

  app.listen(appEnv.port, () => {
    logger.info('LedgerAxis backend listening', { port: appEnv.port });
  });
}

export default app;
