import { ok } from '../../../shared/utils/response.js';
import { analyticsService } from '../services/analytics.service.js';

const wrap = (fn) => async (req, res, next) => { try { return ok(res, await fn(req)); } catch (e) { return next(e); } };

export const analyticsController = {
  industrySummary: wrap((req) => analyticsService.industrySummary({ tenantId: req.user.tenantId })),
  topCompanies: wrap((req) => analyticsService.topCompanies({ tenantId: req.user.tenantId })),
  directorOverlap: wrap((req) => analyticsService.directorOverlap({ tenantId: req.user.tenantId })),
  sourceDistribution: wrap((req) => analyticsService.sourceDistribution({ tenantId: req.user.tenantId }))
};
