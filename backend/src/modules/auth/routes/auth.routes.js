import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';
import { validate } from '../../../shared/middleware/validate.middleware.js';
import { authenticate } from '../../../shared/middleware/auth.middleware.js';

export const authRouter = Router();

/** @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register tenant and first user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tenantName, fullName, email, password]
 *             properties:
 *               tenantName: { type: string }
 *               fullName: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *               role: { type: string, enum: [viewer, editor, admin], default: admin }
 *     responses:
 *       200:
 *         description: Tenant and first user created.
 */
/** @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login success.
 *       401:
 *         description: Invalid credentials.
 */
/** @swagger
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get the current authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user details.
 *       401:
 *         description: Missing or invalid token.
 */
authRouter.post('/register', validate(registerSchema), authController.register);
authRouter.post('/login', validate(loginSchema), authController.login);
authRouter.get('/me', authenticate, authController.me);
