import { companiesService } from '../services/companies.service.js';

export const companiesController = {
  health: async (req, res, next) => {
    try {
      const result = await companiesService.health();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
};
