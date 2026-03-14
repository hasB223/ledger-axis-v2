import { auditService } from '../services/audit.service.js';
import { buildRequestContext } from '../../../shared/context/request-context.js';
import { ok } from '../../../shared/utils/response.js';

export const auditController = {
  getCompanyAuditLog: async (req, res, next) => {
    try {
      return ok(res, await auditService.getCompanyAuditLog(buildRequestContext(req), { companyId: req.params.id }));
    } catch (e) { return next(e); }
  }
};
