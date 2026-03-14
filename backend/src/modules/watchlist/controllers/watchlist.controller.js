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
};
