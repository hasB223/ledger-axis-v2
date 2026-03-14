import { query } from '../../../shared/db/pool.js';

export const sourceDistributionQuery = {
  async execute(ctx) {
    const sql = `
      WITH tenant_companies AS (
        SELECT source
        FROM companies
        WHERE tenant_id = $1
      )
      SELECT source, COUNT(*)::int AS count
      FROM tenant_companies
      GROUP BY source
      ORDER BY count DESC, source ASC
    `;

    const { rows } = await query(sql, [ctx.tenantId]);
    return rows.map((row) => ({
      source: row.source,
      count: row.count
    }));
  }
};
