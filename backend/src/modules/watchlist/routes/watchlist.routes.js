import { Router } from 'express';
import { authenticate, authorize } from '../../../shared/middleware/auth.middleware.js';
import { validate } from '../../../shared/middleware/validate.middleware.js';
import { watchlistCreateSchema } from '../validators/watchlist.validator.js';
import { watchlistController } from '../controllers/watchlist.controller.js';

export const watchlistRouter = Router();
watchlistRouter.use(authenticate, authorize('viewer', 'editor', 'admin'));
/** @swagger
 * /watchlist:
 *   get:
 *     tags: [Watchlist]
 *     summary: List current user watchlist entries for the tenant
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Watchlist entries.
 *   post:
 *     tags: [Watchlist]
 *     summary: Add a company to the current user watchlist
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WatchlistPayload'
 *     responses:
 *       201:
 *         description: Watchlist entry created.
 *       409:
 *         description: Duplicate watchlist entry.
 */
/** @swagger
 * /watchlist/{id}:
 *   delete:
 *     tags: [Watchlist]
 *     summary: Remove a watchlist entry owned by the current user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Watchlist entry removed.
 *       404:
 *         description: Watchlist entry not found.
 */
watchlistRouter.get('/', watchlistController.list);
watchlistRouter.post('/', validate(watchlistCreateSchema), watchlistController.create);
watchlistRouter.delete('/:id', watchlistController.remove);
