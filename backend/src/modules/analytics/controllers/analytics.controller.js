import { analyticsService } from '../services/analytics.service.js';
import { withRequestContext } from '../../../shared/utils/controller.js';

export const analyticsController = {
  industrySummary: withRequestContext((ctx) => analyticsService.industrySummary(ctx)),
  topCompanies: withRequestContext((ctx) => analyticsService.topCompanies(ctx)),
  directorOverlap: withRequestContext((ctx) => analyticsService.directorOverlap(ctx)),
  sourceDistribution: withRequestContext((ctx) => analyticsService.sourceDistribution(ctx)),
  revenueDistribution: withRequestContext((ctx) => analyticsService.revenueDistribution(ctx))
};
