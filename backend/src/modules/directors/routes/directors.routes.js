import { Router } from 'express';
<<<<<<< ours
import { directorsController } from '../controllers/directors.controller.js';

export const directorsRouter = Router();

// TODO: define directors endpoints and attach validators/auth middleware.
directorsRouter.get('/health', directorsController.health);
=======
import { authenticate, authorize } from '../../../shared/middleware/auth.middleware.js';
import { directorsController } from '../controllers/directors.controller.js';

export const directorsRouter = Router();
directorsRouter.get('/:id', authenticate, authorize('viewer', 'editor', 'admin'), directorsController.getById);
>>>>>>> theirs
