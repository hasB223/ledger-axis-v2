import { Router } from 'express';
<<<<<<< ours
import { analyticsController } from '../controllers/analytics.controller.js';

export const analyticsRouter = Router();

// TODO: define analytics endpoints and attach validators/auth middleware.
analyticsRouter.get('/health', analyticsController.health);
=======
import { authenticate, authorize } from '../../../shared/middleware/auth.middleware.js';
import { analyticsController } from '../controllers/analytics.controller.js';

export const analyticsRouter = Router();
analyticsRouter.use(authenticate, authorize('viewer', 'editor', 'admin'));
analyticsRouter.get('/industry-summary', analyticsController.industrySummary);
analyticsRouter.get('/top-companies', analyticsController.topCompanies);
analyticsRouter.get('/director-overlap', analyticsController.directorOverlap);
analyticsRouter.get('/source-distribution', analyticsController.sourceDistribution);
>>>>>>> theirs
