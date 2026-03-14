import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';
import { validate } from '../../../shared/middleware/validate.middleware.js';
import { authenticate } from '../../../shared/middleware/auth.middleware.js';

export const authRouter = Router();

/** @swagger
 * /auth/register:
 *   post:
 *     summary: Register tenant and first user
 */
authRouter.post('/register', validate(registerSchema), authController.register);
authRouter.post('/login', validate(loginSchema), authController.login);
authRouter.get('/me', authenticate, authController.me);
