import { auditRepository } from '../repositories/audit.repository.js';

export const auditService = {
<<<<<<< ours
  health: async () => {
    // TODO: replace with real business logic and service orchestration.
    return auditRepository.health();
  }
=======
  getCompanyAuditLog: ({ tenantId, companyId }) => auditRepository.getCompanyAuditLog({ tenantId, companyId }),
  log: (payload) => auditRepository.createLog(payload)
>>>>>>> theirs
};
