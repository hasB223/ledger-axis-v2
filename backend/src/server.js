import cron from 'node-cron';
import { createApp } from './app.js';
import { env } from './shared/config/env.js';
import { ingestionService } from './modules/ingestion/services/ingestion.service.js';

const app = createApp();

if (env.nodeEnv !== 'test') {
  cron.schedule(env.ingestionCron, async () => {
    try {
      await ingestionService.trigger({ triggeredBy: 'scheduler', role: 'admin', tenantId: null, userId: null });
    } catch (error) {
      console.error('Ingestion cron failed', error);
    }
  });

  app.listen(env.port, () => {
    console.log(`LedgerAxis backend listening on ${env.port}`);
  });
}

export default app;
