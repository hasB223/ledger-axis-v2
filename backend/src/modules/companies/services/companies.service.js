import { AppError } from '../../../shared/errors/app-error.js';
import { logger } from '../../../shared/utils/logger.js';
import { companiesRepository } from '../repositories/companies.repository.js';
import { auditService } from '../../audit/services/audit.service.js';
import { companyDomainService } from '../domain/company-domain.service.js';

export const companiesService = {
  list: (ctx, query) => companiesRepository.list(ctx, query),
  async getById(ctx, { id }) {
    const company = await companiesRepository.findById(ctx, { id });
    if (!company) throw new AppError('Company not found', 'NOT_FOUND', 404);
    return company;
  },
  async create(ctx, { payload }) {
    const company = await companiesRepository.create(ctx, companyDomainService.normalizeCreatePayload(payload));
    await auditService.log(
      companyDomainService.buildCreateAuditEvent({
        tenantId: ctx.tenantId,
        companyId: company.id,
        actorUserId: ctx.userId,
        payload
      })
    );
    logger.info('Company created', { ...ctx, companyId: company.id });
    return company;
  },
  async update(ctx, { id, payload }) {
    const before = await companiesRepository.findById(ctx, { id });
    if (!before) throw new AppError('Company not found', 'NOT_FOUND', 404);
    const updated = await companiesRepository.update(ctx, {
      id,
      patch: companyDomainService.normalizeUpdatePayload(payload)
    });
    await auditService.log(
      companyDomainService.buildUpdateAuditEvent({
        tenantId: ctx.tenantId,
        companyId: id,
        actorUserId: ctx.userId,
        before,
        payload
      })
    );
    logger.info('Company updated', { ...ctx, companyId: id });
    return updated;
  },
  async remove(ctx, { id }) {
    const deleted = await companiesRepository.remove(ctx, { id });
    if (!deleted) throw new AppError('Company not found', 'NOT_FOUND', 404);
    await auditService.log(
      companyDomainService.buildDeleteAuditEvent({
        tenantId: ctx.tenantId,
        companyId: id,
        actorUserId: ctx.userId
      })
    );
    logger.info('Company removed', { ...ctx, companyId: id });
    return { id };
  },
  getDirectorsByCompany: (ctx, { companyId }) => companiesRepository.directorsByCompany(ctx, { companyId })
};
