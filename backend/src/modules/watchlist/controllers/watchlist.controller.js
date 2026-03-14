<<<<<<< ours
import { watchlistService } from '../services/watchlist.service.js';

export const watchlistController = {
  health: async (req, res, next) => {
    try {
      const result = await watchlistService.health();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
=======
import { ok } from '../../../shared/utils/response.js';
import { watchlistService } from '../services/watchlist.service.js';

export const watchlistController = {
  list: async (req, res, next) => { try { return ok(res, await watchlistService.list({ tenantId: req.user.tenantId, userId: req.user.userId })); } catch (e) { return next(e); } },
  create: async (req, res, next) => { try { return ok(res, await watchlistService.create({ tenantId: req.user.tenantId, userId: req.user.userId, payload: req.body }), 201); } catch (e) { return next(e); } },
  remove: async (req, res, next) => { try { return ok(res, await watchlistService.remove({ tenantId: req.user.tenantId, userId: req.user.userId, id: req.params.id })); } catch (e) { return next(e); } }
>>>>>>> theirs
};
