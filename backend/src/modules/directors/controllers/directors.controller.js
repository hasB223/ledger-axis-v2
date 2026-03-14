import { directorsService } from '../services/directors.service.js';
<<<<<<< ours

export const directorsController = {
  health: async (req, res, next) => {
    try {
      const result = await directorsService.health();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
=======
import { ok } from '../../../shared/utils/response.js';

export const directorsController = {
  getById: async (req, res, next) => { try { return ok(res, await directorsService.getById({ tenantId: req.user.tenantId, id: req.params.id })); } catch (e) { return next(e); } }
>>>>>>> theirs
};
