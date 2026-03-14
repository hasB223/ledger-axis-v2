import { Router } from 'express';
import { authenticate, authorize } from '../../../shared/middleware/auth.middleware.js';
import { validate } from '../../../shared/middleware/validate.middleware.js';
import { watchlistCreateSchema } from '../validators/watchlist.validator.js';
import { watchlistController } from '../controllers/watchlist.controller.js';

export const watchlistRouter = Router();
watchlistRouter.use(authenticate, authorize('viewer', 'editor', 'admin'));
watchlistRouter.get('/', watchlistController.list);
watchlistRouter.post('/', validate(watchlistCreateSchema), watchlistController.create);
watchlistRouter.delete('/:id', watchlistController.remove);
