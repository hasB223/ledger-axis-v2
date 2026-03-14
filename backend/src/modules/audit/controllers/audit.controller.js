import { auditService } from '../services/audit.service.js';
import { withRequestContext } from '../../../shared/utils/controller.js';

export const auditController = {
  getCompanyAuditLog: withRequestContext((ctx, req) => auditService.getCompanyAuditLog(ctx, { companyId: req.params.id }))
};
