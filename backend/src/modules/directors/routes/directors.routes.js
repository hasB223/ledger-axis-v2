import { Router } from 'express';
import { authenticate, authorize } from '../../../shared/middleware/auth.middleware.js';
import { directorsController } from '../controllers/directors.controller.js';

export const directorsRouter = Router();
/** @swagger
 * /directors/{id}:
 *   get:
 *     tags: [Directors]
 *     summary: Get a director only if linked through tenant-visible companies
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Director details.
 *       404:
 *         description: Director is not visible to the tenant.
 */
directorsRouter.get('/:id', authenticate, authorize('viewer', 'editor', 'admin'), directorsController.getById);
