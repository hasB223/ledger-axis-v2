import { ingestionService } from '../services/ingestion.service.js';
import { withRequestContext } from '../../../shared/utils/controller.js';

export const ingestionController = {
  trigger: withRequestContext((ctx, req) => ingestionService.trigger(ctx, { triggeredBy: 'manual', dryRun: req.body.dryRun }))
};
