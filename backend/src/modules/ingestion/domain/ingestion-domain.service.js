const TRACKED_FIELDS = ['name', 'industry', 'source', 'status', 'annualRevenue'];

export const ingestionDomainService = {
  extractCompanies(payload) {
    if (Array.isArray(payload)) {
      return payload;
    }

    return Array.isArray(payload?.companies) ? payload.companies : [];
  },

  normalizeCompany(item) {
    return {
      registrationNo: item.registrationNo,
      name: item.name,
      industry: item.industry ?? null,
      source: item.source || 'registry',
      status: item.status || 'active',
      annualRevenue: item.annualRevenue ?? null
    };
  },

  getChangedFields(before, after) {
    if (!before) {
      return [...TRACKED_FIELDS];
    }

    return TRACKED_FIELDS.filter((field) => before[field] !== after[field]);
  },

  shouldUpsert(before, normalizedCompany) {
    return !before || this.getChangedFields(before, normalizedCompany).length > 0;
  },

  buildAuditEvent({ tenantId, actorUserId, companyId, before, normalizedCompany, triggeredBy }) {
    const changedFields = this.getChangedFields(before, normalizedCompany);

    if (changedFields.length === 0) {
      return null;
    }

    return {
      tenantId,
      entityType: 'company',
      entityId: companyId,
      action: before ? 'ingestion.update' : 'ingestion.create',
      changedFields,
      actorUserId,
      metadata: { triggeredBy }
    };
  }
};
