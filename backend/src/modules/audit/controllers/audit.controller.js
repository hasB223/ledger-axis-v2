import { auditService } from '../services/audit.service.js';
import { ok } from '../../../shared/utils/response.js';

export const auditController = {
  getCompanyAuditLog: async (req, res, next) => {
    try {
      return ok(res, await auditService.getCompanyAuditLog({ tenantId: req.user.tenantId, companyId: req.params.id }));
    } catch (e) { return next(e); }
  }
};
