import { directorsService } from '../services/directors.service.js';

export const directorsController = {
  health: async (req, res, next) => {
    try {
      const result = await directorsService.health();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
};
