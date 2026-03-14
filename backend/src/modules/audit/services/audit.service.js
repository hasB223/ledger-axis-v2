import { auditRepository } from '../repositories/audit.repository.js';

export const auditService = {
  getCompanyAuditLog: (ctx, { companyId }) => auditRepository.getCompanyAuditLog(ctx, { companyId }),
  log: (payload) => auditRepository.createLog(payload)
};
