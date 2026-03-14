<<<<<<< ours
import { ingestionRepository } from '../repositories/ingestion.repository.js';

export const ingestionService = {
  health: async () => {
    // TODO: replace with real business logic and service orchestration.
    return ingestionRepository.health();
=======
import { env } from '../../../shared/config/env.js';
import { auditService } from '../../audit/services/audit.service.js';
import { ingestionRepository } from '../repositories/ingestion.repository.js';

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
    const companies = Array.isArray(payload) ? payload : payload.companies || [];
    const results = [];

    for (const item of companies) {
      const before = await ingestionRepository.findCompanyByRegistrationNo({ tenantId, registrationNo: item.registrationNo });
      if (dryRun) continue;
      const upserted = await ingestionRepository.upsertCompany({
        tenantId,
        registrationNo: item.registrationNo,
        name: item.name,
        industry: item.industry,
        source: item.source || 'registry',
        status: item.status || 'active'
      });
      const changedFields = before
        ? ['name', 'industry', 'source', 'status'].filter((field) => before[field] !== upserted[field])
        : ['name', 'industry', 'source', 'status'];
      if (changedFields.length > 0) {
        await auditService.log({
          tenantId,
          entityType: 'company',
          entityId: upserted.id,
          action: before ? 'ingestion.update' : 'ingestion.create',
          changedFields,
          actorUserId: userId,
          metadata: { triggeredBy }
        });
      }
      results.push({ id: upserted.id, registrationNo: upserted.registration_no });
    }
    return { processed: companies.length, changed: results.length, dryRun };
>>>>>>> theirs
  }
};
