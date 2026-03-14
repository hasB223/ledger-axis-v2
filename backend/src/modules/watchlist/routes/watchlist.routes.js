import { Router } from 'express';
<<<<<<< ours
import { watchlistController } from '../controllers/watchlist.controller.js';

export const watchlistRouter = Router();

// TODO: define watchlist endpoints and attach validators/auth middleware.
watchlistRouter.get('/health', watchlistController.health);
=======
import { authenticate, authorize } from '../../../shared/middleware/auth.middleware.js';
import { validate } from '../../../shared/middleware/validate.middleware.js';
import { watchlistCreateSchema } from '../validators/watchlist.validator.js';
import { watchlistController } from '../controllers/watchlist.controller.js';

export const watchlistRouter = Router();
watchlistRouter.use(authenticate, authorize('viewer', 'editor', 'admin'));
watchlistRouter.get('/', watchlistController.list);
watchlistRouter.post('/', validate(watchlistCreateSchema), watchlistController.create);
watchlistRouter.delete('/:id', watchlistController.remove);
>>>>>>> theirs
