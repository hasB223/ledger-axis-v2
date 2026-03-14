import { Router } from 'express';
<<<<<<< ours
import { auditController } from '../controllers/audit.controller.js';

export const auditRouter = Router();

// TODO: define audit endpoints and attach validators/auth middleware.
auditRouter.get('/health', auditController.health);
=======
import { authenticate, authorize } from '../../../shared/middleware/auth.middleware.js';
import { auditController } from '../controllers/audit.controller.js';

export const auditRouter = Router();
auditRouter.get('/companies/:id/audit-log', authenticate, authorize('viewer', 'editor', 'admin'), auditController.getCompanyAuditLog);
>>>>>>> theirs
