import { watchlistService } from '../services/watchlist.service.js';
import { withRequestContext } from '../../../shared/utils/controller.js';

export const watchlistController = {
  list: withRequestContext((ctx) => watchlistService.list(ctx)),
  create: withRequestContext((ctx, req) => watchlistService.create(ctx, { payload: req.body }), 201),
  remove: withRequestContext((ctx, req) => watchlistService.remove(ctx, { id: req.params.id }))
};
