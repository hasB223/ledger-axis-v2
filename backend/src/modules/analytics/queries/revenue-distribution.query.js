import { query } from '../../../shared/db/pool.js';

export const revenueDistributionQuery = {
  async execute(ctx) {
    const sql = `
      WITH tenant_companies AS (
        SELECT annual_revenue
        FROM companies
        WHERE tenant_id = $1
      )
      SELECT
        CASE
          WHEN annual_revenue IS NULL THEN 'unknown'
          WHEN annual_revenue < 1000000 THEN 'under_1m'
          WHEN annual_revenue < 10000000 THEN '1m_to_10m'
          WHEN annual_revenue < 50000000 THEN '10m_to_50m'
          ELSE '50m_plus'
        END AS band,
        COUNT(*)::int AS count
      FROM tenant_companies
      GROUP BY band
      ORDER BY band
    `;

    const { rows } = await query(sql, [ctx.tenantId]);
    return rows.map((row) => ({
      band: row.band,
      count: row.count
    }));
  }
};
