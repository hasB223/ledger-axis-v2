<<<<<<< ours
export const ingestionRepository = {
  health: async () => ({ module: 'ingestion', status: 'ok' }),

  // TODO: enforce strict tenant isolation in all data access methods.
  // Example signature pattern (required):
  // findById: async ({ tenantId, id }) => {}
  // Avoid ambiguous signatures like findById(id).
=======
import { query } from '../../../shared/db/pool.js';

export const ingestionRepository = {
  async upsertCompany({ tenantId, registrationNo, name, industry, source, status }) {
    const sql = `INSERT INTO companies (tenant_id, registration_no, name, industry, source, status, created_at, updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,NOW(),NOW())
      ON CONFLICT (tenant_id, registration_no)
      DO UPDATE SET name=EXCLUDED.name, industry=EXCLUDED.industry, source=EXCLUDED.source, status=EXCLUDED.status, updated_at=NOW()
      RETURNING *`;
    const { rows } = await query(sql, [tenantId, registrationNo, name, industry || null, source, status]);
    return rows[0];
  },
  async findCompanyByRegistrationNo({ tenantId, registrationNo }) {
    const { rows } = await query('SELECT * FROM companies WHERE tenant_id=$1 AND registration_no=$2', [tenantId, registrationNo]);
    return rows[0] || null;
  }
>>>>>>> theirs
};
