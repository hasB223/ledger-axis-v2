import { Router } from 'express';
import { authRouter } from './modules/auth/routes/auth.routes.js';
import { companiesRouter } from './modules/companies/routes/companies.routes.js';
import { directorsRouter } from './modules/directors/routes/directors.routes.js';
import { analyticsRouter } from './modules/analytics/routes/analytics.routes.js';
import { watchlistRouter } from './modules/watchlist/routes/watchlist.routes.js';
import { auditRouter } from './modules/audit/routes/audit.routes.js';
import { ingestionRouter } from './modules/ingestion/routes/ingestion.routes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/companies', companiesRouter);
apiRouter.use('/directors', directorsRouter);
apiRouter.use('/analytics', analyticsRouter);
apiRouter.use('/watchlist', watchlistRouter);
apiRouter.use('/audit', auditRouter);
apiRouter.use('/ingestion', ingestionRouter);
