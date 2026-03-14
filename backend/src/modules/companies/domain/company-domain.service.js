export const companyDomainService = {
  normalizeCreatePayload(payload) {
    return {
      ...payload,
      annualRevenue: payload.annualRevenue ?? null
    };
  },

  normalizeUpdatePayload(payload) {
    const patch = { ...payload };

    if (Object.prototype.hasOwnProperty.call(patch, 'annualRevenue')) {
      patch.annual_revenue = patch.annualRevenue;
      delete patch.annualRevenue;
    }

    return patch;
  },

  getChangedFields(before, patch) {
    return Object.keys(patch).filter((field) => before[field] !== patch[field]);
  },

  buildCreateAuditEvent({ tenantId, companyId, actorUserId, payload }) {
    return {
      tenantId,
      entityType: 'company',
      entityId: companyId,
      action: 'company.create',
      changedFields: Object.keys(payload),
      actorUserId
    };
  },

  buildUpdateAuditEvent({ tenantId, companyId, actorUserId, before, payload }) {
    return {
      tenantId,
      entityType: 'company',
      entityId: companyId,
      action: 'company.update',
      changedFields: this.getChangedFields(before, payload),
      actorUserId
    };
  },

  buildDeleteAuditEvent({ tenantId, companyId, actorUserId }) {
    return {
      tenantId,
      entityType: 'company',
      entityId: companyId,
      action: 'company.delete',
      changedFields: [],
      actorUserId
    };
  }
};
