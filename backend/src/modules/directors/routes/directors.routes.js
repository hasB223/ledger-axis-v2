import { Router } from 'express';
import { authenticate, authorize } from '../../../shared/middleware/auth.middleware.js';
import { directorsController } from '../controllers/directors.controller.js';

export const directorsRouter = Router();
directorsRouter.get('/:id', authenticate, authorize('viewer', 'editor', 'admin'), directorsController.getById);
