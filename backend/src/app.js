import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

import { appEnv } from './shared/config/app-env.js';
import { checkDatabaseHealth } from './shared/db/health.js';
import { requestIdMiddleware } from './shared/middleware/request-id.middleware.js';
import { errorHandler } from './shared/middleware/error.middleware.js';
import { apiRouter } from './routes.js';
import { swaggerSpec } from './shared/docs/swagger.js';
import { logger } from './shared/utils/logger.js';
import { ok } from './shared/utils/response.js';

export const createApp = () => {
  const app = express();
  app.use(helmet());
  app.use(requestIdMiddleware);
  app.use(morgan(':method :url :status :response-time ms req_id=:req[x-request-id]'));
  app.use(cors({ origin: appEnv.corsOrigin === '*' ? true : appEnv.corsOrigin, credentials: true }));
  app.use(express.json({ limit: '1mb' }));

  const loginLimiter = rateLimit({ windowMs: appEnv.rateLimitWindowMs, max: appEnv.rateLimitMax, standardHeaders: true, legacyHeaders: false });
  app.use(`${appEnv.apiPrefix}/auth/login`, loginLimiter);

  /** @swagger
   * /health:
   *   get:
   *     tags: [Operations]
   *     summary: Lightweight process health check
   *     responses:
   *       200:
   *         description: App process is up.
   */
  app.get('/health', (_req, res) => ok(res, { status: 'ok' }));
  /** @swagger
   * /health/db:
   *   get:
   *     tags: [Operations]
   *     summary: Lightweight PostgreSQL readiness check
   *     responses:
   *       200:
   *         description: Database connectivity check passed.
   *       503:
   *         description: Database connectivity check failed.
   */
  app.get('/health/db', async (req, res) => {
    try {
      await checkDatabaseHealth();
      return ok(res, { status: 'ok' });
    } catch (error) {
      logger.error('Database health check failed', {
        requestId: req.requestId,
        code: 'DB_HEALTHCHECK_FAILED',
        message: error.message
      });
      return res.status(503).json({
        success: false,
        message: 'Database unavailable',
        code: 'DB_UNAVAILABLE'
      });
    }
  });

  if (appEnv.apiDocsEnabled) {
    app.get(`${appEnv.apiPrefix}/docs.json`, (_req, res) => res.json(swaggerSpec));
    app.use(`${appEnv.apiPrefix}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }

  app.use(appEnv.apiPrefix, apiRouter);
  app.use(errorHandler);
  return app;
};
