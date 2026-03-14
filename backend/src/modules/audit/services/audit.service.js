import { auditRepository } from '../repositories/audit.repository.js';

export const auditService = {
  getCompanyAuditLog: ({ tenantId, companyId }) => auditRepository.getCompanyAuditLog({ tenantId, companyId }),
  log: (payload) => auditRepository.createLog(payload)
};
