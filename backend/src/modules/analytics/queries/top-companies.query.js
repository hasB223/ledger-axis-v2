import { query } from '../../../shared/db/pool.js';

export const topCompaniesQuery = {
  async execute(ctx) {
    const sql = `
      WITH ranked_companies AS (
        SELECT
          c.id,
          c.name,
          COUNT(cd.director_id)::int AS director_count
        FROM companies c
        LEFT JOIN company_directors cd ON cd.company_id = c.id
        WHERE c.tenant_id = $1
        GROUP BY c.id, c.name
      )
      SELECT id, name, director_count
      FROM ranked_companies
      ORDER BY director_count DESC, name ASC
      LIMIT 10
    `;

    const { rows } = await query(sql, [ctx.tenantId]);
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      director_count: row.director_count
    }));
  }
};
