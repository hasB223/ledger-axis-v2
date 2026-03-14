import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';

export const authRouter = Router();

// TODO: define auth endpoints and attach validators/auth middleware.
authRouter.get('/health', authController.health);
