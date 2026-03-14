import { analyticsRepository } from '../repositories/analytics.repository.js';

export const analyticsService = {
  industrySummary: ({ tenantId }) => analyticsRepository.industrySummary({ tenantId }),
  topCompanies: ({ tenantId }) => analyticsRepository.topCompanies({ tenantId }),
  directorOverlap: ({ tenantId }) => analyticsRepository.directorOverlap({ tenantId }),
  sourceDistribution: ({ tenantId }) => analyticsRepository.sourceDistribution({ tenantId }),
  revenueDistribution: ({ tenantId }) => analyticsRepository.revenueDistribution({ tenantId })
};
