import { watchlistRepository } from '../repositories/watchlist.repository.js';

export const watchlistService = {
  health: async () => {
    // TODO: replace with real business logic and service orchestration.
    return watchlistRepository.health();
  }
};
