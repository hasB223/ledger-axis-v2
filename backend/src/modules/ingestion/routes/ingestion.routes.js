import { Router } from 'express';
<<<<<<< ours
import { ingestionController } from '../controllers/ingestion.controller.js';

export const ingestionRouter = Router();

// TODO: define ingestion endpoints and attach validators/auth middleware.
ingestionRouter.get('/health', ingestionController.health);
=======
import { authenticate, authorize } from '../../../shared/middleware/auth.middleware.js';
import { validate } from '../../../shared/middleware/validate.middleware.js';
import { ingestionTriggerSchema } from '../validators/ingestion.validator.js';
import { ingestionController } from '../controllers/ingestion.controller.js';

export const ingestionRouter = Router();
ingestionRouter.post('/trigger', authenticate, authorize('admin'), validate(ingestionTriggerSchema), ingestionController.trigger);
>>>>>>> theirs
