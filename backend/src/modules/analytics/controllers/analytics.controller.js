import { ok } from '../../../shared/utils/response.js';
import { buildRequestContext } from '../../../shared/context/request-context.js';
import { analyticsService } from '../services/analytics.service.js';

const wrap = (fn) => async (req, res, next) => { try { return ok(res, await fn(req)); } catch (e) { return next(e); } };

export const analyticsController = {
  industrySummary: wrap((req) => analyticsService.industrySummary(buildRequestContext(req))),
  topCompanies: wrap((req) => analyticsService.topCompanies(buildRequestContext(req))),
  directorOverlap: wrap((req) => analyticsService.directorOverlap(buildRequestContext(req))),
  sourceDistribution: wrap((req) => analyticsService.sourceDistribution(buildRequestContext(req))),
  revenueDistribution: wrap((req) => analyticsService.revenueDistribution(buildRequestContext(req)))
};
