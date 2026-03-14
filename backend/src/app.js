import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

import { env } from './shared/config/env.js';
import { requestIdMiddleware } from './shared/middleware/request-id.middleware.js';
import { errorHandler } from './shared/middleware/error.middleware.js';
import { apiRouter } from './routes.js';
import { swaggerSpec } from './shared/docs/swagger.js';
import { ok } from './shared/utils/response.js';

export const createApp = () => {
  const app = express();
  app.use(helmet());
  app.use(requestIdMiddleware);
  app.use(morgan(':method :url :status :response-time ms req_id=:req[x-request-id]'));
  app.use(cors({ origin: env.corsOrigin === '*' ? true : env.corsOrigin, credentials: true }));
  app.use(express.json({ limit: '1mb' }));

  const loginLimiter = rateLimit({ windowMs: env.rateLimitWindowMs, max: env.rateLimitMax, standardHeaders: true, legacyHeaders: false });
  app.use(`${env.apiPrefix}/auth/login`, loginLimiter);

  app.get('/health', (_req, res) => ok(res, { status: 'ok' }));

  if (env.apiDocsEnabled) {
    app.get(`${env.apiPrefix}/docs.json`, (_req, res) => res.json(swaggerSpec));
    app.use(`${env.apiPrefix}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }

  app.use(env.apiPrefix, apiRouter);
  app.use(errorHandler);
  return app;
};
