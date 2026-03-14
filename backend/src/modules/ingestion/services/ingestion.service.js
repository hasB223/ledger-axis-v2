import { env } from '../../../shared/config/env.js';
import { auditService } from '../../audit/services/audit.service.js';
import { ingestionRepository } from '../repositories/ingestion.repository.js';
import { ingestionDomainService } from '../domain/ingestion-domain.service.js';

export const ingestionService = {
  async trigger({ tenantId, userId, triggeredBy, role, dryRun = false }) {
    if (triggeredBy !== 'scheduler' && role !== 'admin') {
      throw Object.assign(new Error('Forbidden'), { status: 403, code: 'FORBIDDEN' });
    }

    const response = await fetch(env.ingestionSourceUrl);
    if (!response.ok) {
      throw Object.assign(new Error(`Ingestion source error: ${response.status}`), { status: 500, code: 'INTERNAL_ERROR' });
    }
    const payload = await response.json();
    const companies = ingestionDomainService.extractCompanies(payload);
    let changed = 0;

    for (const item of companies) {
      const normalizedCompany = ingestionDomainService.normalizeCompany(item);
      const before = await ingestionRepository.findCompanyByRegistrationNo({
        tenantId,
        registrationNo: normalizedCompany.registrationNo
      });
      if (dryRun) continue;

      if (!ingestionDomainService.shouldUpsert(before, normalizedCompany)) {
        continue;
      }

      const upserted = await ingestionRepository.upsertCompany({
        tenantId,
        ...normalizedCompany
      });
      const auditEvent = ingestionDomainService.buildAuditEvent({
        tenantId,
        actorUserId: userId,
        companyId: upserted.id,
        before,
        normalizedCompany,
        triggeredBy
      });

      if (auditEvent) {
        await auditService.log(auditEvent);
      }

      changed += 1;
    }

    return { processed: companies.length, changed, dryRun };
  }
};
