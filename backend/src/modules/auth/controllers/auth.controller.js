import { authService } from '../services/auth.service.js';
import { ok } from '../../../shared/utils/response.js';

export const authController = {
  register: async (req, res, next) => {
    try { return ok(res, await authService.register(req.body), 201); } catch (e) { return next(e); }
  },
  login: async (req, res, next) => {
    try { return ok(res, await authService.login(req.body)); } catch (e) { return next(e); }
  },
  me: async (req, res, next) => {
    try { return ok(res, await authService.me(req.user)); } catch (e) { return next(e); }
  }
};
