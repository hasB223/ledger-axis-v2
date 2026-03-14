import { ok } from '../../../shared/utils/response.js';
import { buildRequestContext } from '../../../shared/context/request-context.js';
import { watchlistService } from '../services/watchlist.service.js';

export const watchlistController = {
  list: async (req, res, next) => { try { return ok(res, await watchlistService.list(buildRequestContext(req))); } catch (e) { return next(e); } },
  create: async (req, res, next) => { try { return ok(res, await watchlistService.create(buildRequestContext(req), { payload: req.body }), 201); } catch (e) { return next(e); } },
  remove: async (req, res, next) => { try { return ok(res, await watchlistService.remove(buildRequestContext(req), { id: req.params.id })); } catch (e) { return next(e); } }
};
