import { analyticsRepository } from '../repositories/analytics.repository.js';

export const analyticsService = {
<<<<<<< ours
  health: async () => {
    // TODO: replace with real business logic and service orchestration.
    return analyticsRepository.health();
  }
=======
  industrySummary: ({ tenantId }) => analyticsRepository.industrySummary({ tenantId }),
  topCompanies: ({ tenantId }) => analyticsRepository.topCompanies({ tenantId }),
  directorOverlap: ({ tenantId }) => analyticsRepository.directorOverlap({ tenantId }),
  sourceDistribution: ({ tenantId }) => analyticsRepository.sourceDistribution({ tenantId })
>>>>>>> theirs
};
