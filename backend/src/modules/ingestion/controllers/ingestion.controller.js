import { ok } from '../../../shared/utils/response.js';
import { buildRequestContext } from '../../../shared/context/request-context.js';
import { ingestionService } from '../services/ingestion.service.js';

export const ingestionController = {
  trigger: async (req, res, next) => {
    try {
      return ok(res, await ingestionService.trigger(buildRequestContext(req), { triggeredBy: 'manual', dryRun: req.body.dryRun }));
    } catch (e) { return next(e); }
  }
};
