import { analyticsService } from '../services/analytics.service.js';

export const analyticsController = {
  health: async (req, res, next) => {
    try {
      const result = await analyticsService.health();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
};
