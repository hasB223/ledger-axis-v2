<<<<<<< ours
export const directorsRepository = {
  health: async () => ({ module: 'directors', status: 'ok' }),

  // TODO: enforce strict tenant isolation in all data access methods.
  // Example signature pattern (required):
  // findById: async ({ tenantId, id }) => {}
  // Avoid ambiguous signatures like findById(id).
=======
import { query } from '../../../shared/db/pool.js';

export const directorsRepository = {
  async findByIdVisibleToTenant({ tenantId, directorId }) {
    const sql = `SELECT DISTINCT d.* FROM directors d
      JOIN company_directors cd ON cd.director_id=d.id
      JOIN companies c ON c.id=cd.company_id
      WHERE d.id=$1 AND c.tenant_id=$2`;
    const { rows } = await query(sql, [directorId, tenantId]);
    return rows[0] || null;
  }
>>>>>>> theirs
};
