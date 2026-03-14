import { query } from '../../../shared/db/pool.js';

export const directorsRepository = {
  async findByIdVisibleToTenant(ctx, { directorId }) {
    const sql = `SELECT DISTINCT d.* FROM directors d
      JOIN company_directors cd ON cd.director_id=d.id
      JOIN companies c ON c.id=cd.company_id
      WHERE d.id=$1 AND c.tenant_id=$2`;
    const { rows } = await query(sql, [directorId, ctx.tenantId]);
    return rows[0] || null;
  }
};
