import { ingestionRepository } from '../repositories/ingestion.repository.js';

export const ingestionService = {
  health: async () => {
    // TODO: replace with real business logic and service orchestration.
    return ingestionRepository.health();
  }
};
