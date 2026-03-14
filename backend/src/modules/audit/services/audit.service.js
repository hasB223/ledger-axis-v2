import { auditRepository } from '../repositories/audit.repository.js';

export const auditService = {
  health: async () => {
    // TODO: replace with real business logic and service orchestration.
    return auditRepository.health();
  }
};
