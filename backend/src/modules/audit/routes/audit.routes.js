import { Router } from 'express';
import { auditController } from '../controllers/audit.controller.js';

export const auditRouter = Router();

// TODO: define audit endpoints and attach validators/auth middleware.
auditRouter.get('/health', auditController.health);
