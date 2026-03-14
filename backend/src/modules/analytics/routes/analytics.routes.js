import { Router } from 'express';
import { authenticate, authorize } from '../../../shared/middleware/auth.middleware.js';
import { analyticsController } from '../controllers/analytics.controller.js';

export const analyticsRouter = Router();
analyticsRouter.use(authenticate, authorize('viewer', 'editor', 'admin'));
/** @swagger
 * /analytics/industry-summary:
 *   get:
 *     tags: [Analytics]
 *     summary: Count companies by industry for the current tenant
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Industry summary.
 */
/** @swagger
 * /analytics/top-companies:
 *   get:
 *     tags: [Analytics]
 *     summary: Rank companies by linked director count
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Top companies by director overlap.
 */
/** @swagger
 * /analytics/director-overlap:
 *   get:
 *     tags: [Analytics]
 *     summary: Directors linked to more than one tenant-visible company
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Director overlap summary.
 */
/** @swagger
 * /analytics/source-distribution:
 *   get:
 *     tags: [Analytics]
 *     summary: Count companies by data source
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Source distribution.
 */
/** @swagger
 * /analytics/revenue-distribution:
 *   get:
 *     tags: [Analytics]
 *     summary: Count companies by annual revenue band
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Revenue distribution bands.
 */
analyticsRouter.get('/industry-summary', analyticsController.industrySummary);
analyticsRouter.get('/top-companies', analyticsController.topCompanies);
analyticsRouter.get('/director-overlap', analyticsController.directorOverlap);
analyticsRouter.get('/source-distribution', analyticsController.sourceDistribution);
analyticsRouter.get('/revenue-distribution', analyticsController.revenueDistribution);
