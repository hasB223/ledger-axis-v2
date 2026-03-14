import { buildRequestContext } from '../../../shared/context/request-context.js';
import { directorsService } from '../services/directors.service.js';
import { ok } from '../../../shared/utils/response.js';

export const directorsController = {
  getById: async (req, res, next) => { try { return ok(res, await directorsService.getById(buildRequestContext(req), { id: req.params.id })); } catch (e) { return next(e); } }
};
