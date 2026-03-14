import { analyticsRepository } from '../repositories/analytics.repository.js';

export const analyticsService = {
  health: async () => {
    // TODO: replace with real business logic and service orchestration.
    return analyticsRepository.health();
  }
};
