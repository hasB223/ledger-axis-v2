import { companiesRepository } from '../repositories/companies.repository.js';

export const companiesService = {
  health: async () => {
    // TODO: replace with real business logic and service orchestration.
    return companiesRepository.health();
  }
};
