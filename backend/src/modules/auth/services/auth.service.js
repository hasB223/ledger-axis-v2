import { authRepository } from '../repositories/auth.repository.js';

export const authService = {
  health: async () => {
    // TODO: replace with real business logic and service orchestration.
    return authRepository.health();
  }
};
