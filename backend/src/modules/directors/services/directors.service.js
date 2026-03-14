import { directorsRepository } from '../repositories/directors.repository.js';

export const directorsService = {
  health: async () => {
    // TODO: replace with real business logic and service orchestration.
    return directorsRepository.health();
  }
};
