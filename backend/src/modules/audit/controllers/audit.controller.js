import { auditService } from '../services/audit.service.js';
<<<<<<< ours

export const auditController = {
  health: async (req, res, next) => {
    try {
      const result = await auditService.health();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
=======
import { ok } from '../../../shared/utils/response.js';

export const auditController = {
  getCompanyAuditLog: async (req, res, next) => {
    try {
      return ok(res, await auditService.getCompanyAuditLog({ tenantId: req.user.tenantId, companyId: req.params.id }));
    } catch (e) { return next(e); }
>>>>>>> theirs
  }
};
