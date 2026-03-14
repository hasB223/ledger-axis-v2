import { query } from '../../../shared/db/pool.js';

export const industrySummaryQuery = {
  async execute(ctx) {
    const sql = `
      WITH tenant_companies AS (
        SELECT industry
        FROM companies
        WHERE tenant_id = $1
      )
      SELECT
        COALESCE(industry, 'unknown') AS industry,
        COUNT(*)::int AS count
      FROM tenant_companies
      GROUP BY COALESCE(industry, 'unknown')
      ORDER BY count DESC, industry ASC
    `;

    const { rows } = await query(sql, [ctx.tenantId]);
    return rows.map((row) => ({
      industry: row.industry,
      count: row.count
    }));
  }
};
