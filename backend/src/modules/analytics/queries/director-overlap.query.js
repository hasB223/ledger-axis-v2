import { query } from '../../../shared/db/pool.js';

export const directorOverlapQuery = {
  async execute(ctx) {
    const sql = `
      WITH tenant_visible_links AS (
        SELECT
          d.id AS director_id,
          d.full_name,
          cd.company_id
        FROM directors d
        JOIN company_directors cd ON cd.director_id = d.id
        JOIN companies c ON c.id = cd.company_id
        WHERE c.tenant_id = $1
      )
      SELECT
        director_id,
        full_name,
        COUNT(DISTINCT company_id)::int AS companies_count
      FROM tenant_visible_links
      GROUP BY director_id, full_name
      HAVING COUNT(DISTINCT company_id) > 1
      ORDER BY companies_count DESC, full_name ASC
    `;

    const { rows } = await query(sql, [ctx.tenantId]);
    return rows.map((row) => ({
      director_id: row.director_id,
      full_name: row.full_name,
      companies_count: row.companies_count
    }));
  }
};
