import { analyticsRepository } from '../repositories/analytics.repository.js';

export const analyticsService = {
  industrySummary: (ctx) => analyticsRepository.industrySummary(ctx),
  topCompanies: (ctx) => analyticsRepository.topCompanies(ctx),
  directorOverlap: (ctx) => analyticsRepository.directorOverlap(ctx),
  sourceDistribution: (ctx) => analyticsRepository.sourceDistribution(ctx),
  revenueDistribution: (ctx) => analyticsRepository.revenueDistribution(ctx)
};
