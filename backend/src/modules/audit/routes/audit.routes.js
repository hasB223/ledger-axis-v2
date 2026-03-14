import { Router } from 'express';
import { authenticate, authorize } from '../../../shared/middleware/auth.middleware.js';
import { auditController } from '../controllers/audit.controller.js';

export const auditRouter = Router();
auditRouter.get('/companies/:id/audit-log', authenticate, authorize('viewer', 'editor', 'admin'), auditController.getCompanyAuditLog);
