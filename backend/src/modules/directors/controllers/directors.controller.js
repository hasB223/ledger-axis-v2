import { directorsService } from '../services/directors.service.js';
import { withRequestContext } from '../../../shared/utils/controller.js';

export const directorsController = {
  getById: withRequestContext((ctx, req) => directorsService.getById(ctx, { id: req.params.id }))
};
