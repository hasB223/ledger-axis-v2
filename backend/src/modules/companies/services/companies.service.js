<<<<<<< ours
import { companiesRepository } from '../repositories/companies.repository.js';

export const companiesService = {
  health: async () => {
    // TODO: replace with real business logic and service orchestration.
    return companiesRepository.health();
  }
=======
import { AppError } from '../../../shared/errors/app-error.js';
import { companiesRepository } from '../repositories/companies.repository.js';
import { auditService } from '../../audit/services/audit.service.js';

const changed = (before, after) => Object.keys(after).filter((k) => before[k] !== after[k]);

export const companiesService = {
  list: ({ tenantId, query }) => companiesRepository.list({ tenantId, ...query }),
  async getById({ tenantId, id }) {
    const company = await companiesRepository.findById({ tenantId, id });
    if (!company) throw new AppError('Company not found', 'NOT_FOUND', 404);
    return company;
  },
  async create({ tenantId, userId, payload }) {
    const company = await companiesRepository.create({ tenantId, ...payload });
    await auditService.log({ tenantId, entityType: 'company', entityId: company.id, action: 'company.create', changedFields: Object.keys(payload), actorUserId: userId });
    return company;
  },
  async update({ tenantId, id, payload, userId }) {
    const before = await companiesRepository.findById({ tenantId, id });
    if (!before) throw new AppError('Company not found', 'NOT_FOUND', 404);
    const updated = await companiesRepository.update({ tenantId, id, patch: payload });
    await auditService.log({ tenantId, entityType: 'company', entityId: id, action: 'company.update', changedFields: changed(before, payload), actorUserId: userId });
    return updated;
  },
  async remove({ tenantId, id, userId }) {
    const deleted = await companiesRepository.remove({ tenantId, id });
    if (!deleted) throw new AppError('Company not found', 'NOT_FOUND', 404);
    await auditService.log({ tenantId, entityType: 'company', entityId: id, action: 'company.delete', changedFields: [], actorUserId: userId });
    return { id };
  },
  getDirectorsByCompany: ({ tenantId, companyId }) => companiesRepository.directorsByCompany({ tenantId, companyId })
>>>>>>> theirs
};
