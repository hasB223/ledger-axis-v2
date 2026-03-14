import { query } from '../../../shared/db/pool.js';

export const analyticsRepository = {
  industrySummary: async ({ tenantId }) => (await query('SELECT industry, COUNT(*)::int AS count FROM companies WHERE tenant_id=$1 GROUP BY industry ORDER BY count DESC', [tenantId])).rows,
  topCompanies: async ({ tenantId }) => (await query(`SELECT c.id, c.name, COUNT(cd.director_id)::int AS director_count
    FROM companies c LEFT JOIN company_directors cd ON cd.company_id=c.id
    WHERE c.tenant_id=$1 GROUP BY c.id ORDER BY director_count DESC, c.name ASC LIMIT 10`, [tenantId])).rows,
  directorOverlap: async ({ tenantId }) => (await query(`SELECT d.id AS director_id, d.full_name, COUNT(DISTINCT cd.company_id)::int AS companies_count
    FROM directors d JOIN company_directors cd ON cd.director_id=d.id JOIN companies c ON c.id=cd.company_id
    WHERE c.tenant_id=$1 GROUP BY d.id, d.full_name HAVING COUNT(DISTINCT cd.company_id) > 1 ORDER BY companies_count DESC`, [tenantId])).rows,
  sourceDistribution: async ({ tenantId }) => (await query('SELECT source, COUNT(*)::int AS count FROM companies WHERE tenant_id=$1 GROUP BY source ORDER BY count DESC', [tenantId])).rows
};
