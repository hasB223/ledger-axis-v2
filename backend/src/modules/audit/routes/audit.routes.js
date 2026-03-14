import { Router } from 'express';
import { authenticate, authorize } from '../../../shared/middleware/auth.middleware.js';
import { auditController } from '../controllers/audit.controller.js';

export const auditRouter = Router();
/** @swagger
 * /companies/{id}/audit-log:
 *   get:
 *     tags: [Audit]
 *     summary: Get audit log entries for a tenant-visible company
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Company audit log entries.
 */
auditRouter.get('/companies/:id/audit-log', authenticate, authorize('viewer', 'editor', 'admin'), auditController.getCompanyAuditLog);
