import { AppError } from '../../../shared/errors/app-error.js';
import { companiesRepository } from '../repositories/companies.repository.js';
import { auditService } from '../../audit/services/audit.service.js';
import { companyDomainService } from '../domain/company-domain.service.js';

export const companiesService = {
  list: ({ tenantId, query }) => companiesRepository.list({ tenantId, ...query }),
  async getById({ tenantId, id }) {
    const company = await companiesRepository.findById({ tenantId, id });
    if (!company) throw new AppError('Company not found', 'NOT_FOUND', 404);
    return company;
  },
  async create({ tenantId, userId, payload }) {
    const company = await companiesRepository.create({
      tenantId,
      ...companyDomainService.normalizeCreatePayload(payload)
    });
    await auditService.log(
      companyDomainService.buildCreateAuditEvent({
        tenantId,
        companyId: company.id,
        actorUserId: userId,
        payload
      })
    );
    return company;
  },
  async update({ tenantId, id, payload, userId }) {
    const before = await companiesRepository.findById({ tenantId, id });
    if (!before) throw new AppError('Company not found', 'NOT_FOUND', 404);
    const updated = await companiesRepository.update({
      tenantId,
      id,
      patch: companyDomainService.normalizeUpdatePayload(payload)
    });
    await auditService.log(
      companyDomainService.buildUpdateAuditEvent({
        tenantId,
        companyId: id,
        actorUserId: userId,
        before,
        payload
      })
    );
    return updated;
  },
  async remove({ tenantId, id, userId }) {
    const deleted = await companiesRepository.remove({ tenantId, id });
    if (!deleted) throw new AppError('Company not found', 'NOT_FOUND', 404);
    await auditService.log(
      companyDomainService.buildDeleteAuditEvent({
        tenantId,
        companyId: id,
        actorUserId: userId
      })
    );
    return { id };
  },
  getDirectorsByCompany: ({ tenantId, companyId }) => companiesRepository.directorsByCompany({ tenantId, companyId })
};
