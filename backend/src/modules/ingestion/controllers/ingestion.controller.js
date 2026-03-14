import { ingestionService } from '../services/ingestion.service.js';

export const ingestionController = {
  health: async (req, res, next) => {
    try {
      const result = await ingestionService.health();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
};
