import { Router } from 'express';
import { watchlistController } from '../controllers/watchlist.controller.js';

export const watchlistRouter = Router();

// TODO: define watchlist endpoints and attach validators/auth middleware.
watchlistRouter.get('/health', watchlistController.health);
