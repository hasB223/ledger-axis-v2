import { Router } from 'express';
import { authenticate, authorize } from '../../../shared/middleware/auth.middleware.js';
import { validate } from '../../../shared/middleware/validate.middleware.js';
import { ingestionTriggerSchema } from '../validators/ingestion.validator.js';
import { ingestionController } from '../controllers/ingestion.controller.js';

export const ingestionRouter = Router();
/** @swagger
 * /ingestion/trigger:
 *   post:
 *     tags: [Ingestion]
 *     summary: Trigger ingestion manually
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IngestionTriggerPayload'
 *     responses:
 *       200:
 *         description: Ingestion completed.
 *       403:
 *         description: Only admins may trigger manual ingestion.
 */
ingestionRouter.post('/trigger', authenticate, authorize('admin'), validate(ingestionTriggerSchema), ingestionController.trigger);
