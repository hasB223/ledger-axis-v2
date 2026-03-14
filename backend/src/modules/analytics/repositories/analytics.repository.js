import { query } from '../../../shared/db/pool.js';

export const analyticsRepository = {
  industrySummary: async (ctx) => (await query('SELECT industry, COUNT(*)::int AS count FROM companies WHERE tenant_id=$1 GROUP BY industry ORDER BY count DESC', [ctx.tenantId])).rows,
  topCompanies: async (ctx) => (await query(`SELECT c.id, c.name, COUNT(cd.director_id)::int AS director_count
    FROM companies c LEFT JOIN company_directors cd ON cd.company_id=c.id
    WHERE c.tenant_id=$1 GROUP BY c.id ORDER BY director_count DESC, c.name ASC LIMIT 10`, [ctx.tenantId])).rows,
  directorOverlap: async (ctx) => (await query(`SELECT d.id AS director_id, d.full_name, COUNT(DISTINCT cd.company_id)::int AS companies_count
    FROM directors d JOIN company_directors cd ON cd.director_id=d.id JOIN companies c ON c.id=cd.company_id
    WHERE c.tenant_id=$1 GROUP BY d.id, d.full_name HAVING COUNT(DISTINCT cd.company_id) > 1 ORDER BY companies_count DESC`, [ctx.tenantId])).rows,
  sourceDistribution: async (ctx) => (await query('SELECT source, COUNT(*)::int AS count FROM companies WHERE tenant_id=$1 GROUP BY source ORDER BY count DESC', [ctx.tenantId])).rows,
  revenueDistribution: async (ctx) => (await query(
    `SELECT CASE
        WHEN annual_revenue IS NULL THEN 'unknown'
        WHEN annual_revenue < 1000000 THEN 'under_1m'
        WHEN annual_revenue < 10000000 THEN '1m_to_10m'
        WHEN annual_revenue < 50000000 THEN '10m_to_50m'
        ELSE '50m_plus'
      END AS band,
      COUNT(*)::int AS count
     FROM companies
     WHERE tenant_id=$1
     GROUP BY band
     ORDER BY band`,
    [ctx.tenantId]
  )).rows
};
