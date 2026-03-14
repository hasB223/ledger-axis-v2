import { authService } from '../services/auth.service.js';

export const authController = {
  health: async (req, res, next) => {
    try {
      const result = await authService.health();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
};
