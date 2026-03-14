<<<<<<< ours
import { ingestionService } from '../services/ingestion.service.js';

export const ingestionController = {
  health: async (req, res, next) => {
    try {
      const result = await ingestionService.health();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
=======
import { ok } from '../../../shared/utils/response.js';
import { ingestionService } from '../services/ingestion.service.js';

export const ingestionController = {
  trigger: async (req, res, next) => {
    try {
      return ok(res, await ingestionService.trigger({ ...req.user, triggeredBy: 'manual', dryRun: req.body.dryRun }));
    } catch (e) { return next(e); }
>>>>>>> theirs
  }
};
