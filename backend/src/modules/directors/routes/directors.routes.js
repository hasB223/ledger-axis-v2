import { Router } from 'express';
import { directorsController } from '../controllers/directors.controller.js';

export const directorsRouter = Router();

// TODO: define directors endpoints and attach validators/auth middleware.
directorsRouter.get('/health', directorsController.health);
