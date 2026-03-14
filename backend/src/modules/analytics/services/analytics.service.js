import { industrySummaryQuery } from '../queries/industry-summary.query.js';
import { topCompaniesQuery } from '../queries/top-companies.query.js';
import { directorOverlapQuery } from '../queries/director-overlap.query.js';
import { sourceDistributionQuery } from '../queries/source-distribution.query.js';
import { revenueDistributionQuery } from '../queries/revenue-distribution.query.js';

export const analyticsService = {
  industrySummary: (ctx) => industrySummaryQuery.execute(ctx),
  topCompanies: (ctx) => topCompaniesQuery.execute(ctx),
  directorOverlap: (ctx) => directorOverlapQuery.execute(ctx),
  sourceDistribution: (ctx) => sourceDistributionQuery.execute(ctx),
  revenueDistribution: (ctx) => revenueDistributionQuery.execute(ctx)
};
