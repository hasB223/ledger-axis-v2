import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller.js';

export const analyticsRouter = Router();

// TODO: define analytics endpoints and attach validators/auth middleware.
analyticsRouter.get('/health', analyticsController.health);
