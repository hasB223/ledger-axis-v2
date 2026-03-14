import { auditService } from '../services/audit.service.js';

export const auditController = {
  health: async (req, res, next) => {
    try {
      const result = await auditService.health();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
};
