<<<<<<< ours
export const auditRepository = {
  health: async () => ({ module: 'audit', status: 'ok' }),

  // TODO: enforce strict tenant isolation in all data access methods.
  // Example signature pattern (required):
  // findById: async ({ tenantId, id }) => {}
  // Avoid ambiguous signatures like findById(id).
=======
import { query } from '../../../shared/db/pool.js';

export const auditRepository = {
  async createLog({ tenantId, entityType, entityId, action, changedFields, actorUserId, metadata = {} }) {
    const sql = `INSERT INTO audit_logs (tenant_id, entity_type, entity_id, action, changed_fields, actor_user_id, metadata, created_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,NOW()) RETURNING id, created_at`;
    await query(sql, [tenantId, entityType, entityId, action, changedFields, actorUserId, JSON.stringify(metadata)]);
  },
  async getCompanyAuditLog({ tenantId, companyId }) {
    const { rows } = await query(
      `SELECT id, entity_id, action, changed_fields, actor_user_id, metadata, created_at
       FROM audit_logs WHERE tenant_id=$1 AND entity_type='company' AND entity_id=$2 ORDER BY created_at DESC`,
      [tenantId, companyId]
    );
    return rows;
  }
>>>>>>> theirs
};
