import { Router } from 'express';
import { ingestionController } from '../controllers/ingestion.controller.js';

export const ingestionRouter = Router();

// TODO: define ingestion endpoints and attach validators/auth middleware.
ingestionRouter.get('/health', ingestionController.health);
