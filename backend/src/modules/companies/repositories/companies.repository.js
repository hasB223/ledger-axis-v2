<<<<<<< ours
export const companiesRepository = {
  health: async () => ({ module: 'companies', status: 'ok' }),

  // TODO: enforce strict tenant isolation in all data access methods.
  // Example signature pattern (required):
  // findById: async ({ tenantId, id }) => {}
  // Avoid ambiguous signatures like findById(id).
=======
import { query } from '../../../shared/db/pool.js';

const sortColumns = { name: 'name', created_at: 'created_at', updated_at: 'updated_at' };

export const companiesRepository = {
  async list({ tenantId, q, page, limit, industry, source, sortBy, sortOrder }) {
    const conditions = ['tenant_id = $1'];
    const params = [tenantId];
    if (q) { params.push(`%${q}%`); conditions.push(`(name ILIKE $${params.length} OR registration_no ILIKE $${params.length})`); }
    if (industry) { params.push(industry); conditions.push(`industry = $${params.length}`); }
    if (source) { params.push(source); conditions.push(`source = $${params.length}`); }
    const offset = (page - 1) * limit;
    params.push(limit, offset);
    const column = sortColumns[sortBy] || 'updated_at';
    const order = sortOrder === 'asc' ? 'ASC' : 'DESC';

    const sql = `SELECT id, tenant_id, registration_no, name, industry, source, status, created_at, updated_at
      FROM companies WHERE ${conditions.join(' AND ')}
      ORDER BY ${column} ${order} LIMIT $${params.length - 1} OFFSET $${params.length}`;
    const rows = await query(sql, params);
    return rows.rows;
  },
  async findById({ tenantId, id }) {
    const { rows } = await query('SELECT * FROM companies WHERE tenant_id = $1 AND id = $2', [tenantId, id]);
    return rows[0] || null;
  },
  async create({ tenantId, registrationNo, name, industry, source, status }) {
    const sql = `INSERT INTO companies (tenant_id, registration_no, name, industry, source, status, created_at, updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,NOW(),NOW()) RETURNING *`;
    const { rows } = await query(sql, [tenantId, registrationNo, name, industry || null, source, status]);
    return rows[0];
  },
  async update({ tenantId, id, patch }) {
    const keys = Object.keys(patch);
    const setSql = keys.map((k, i) => `${k} = $${i + 3}`).join(', ');
    const params = [tenantId, id, ...keys.map((k) => patch[k])];
    const sql = `UPDATE companies SET ${setSql}, updated_at = NOW() WHERE tenant_id = $1 AND id = $2 RETURNING *`;
    const { rows } = await query(sql, params);
    return rows[0] || null;
  },
  async remove({ tenantId, id }) {
    const { rowCount } = await query('DELETE FROM companies WHERE tenant_id = $1 AND id = $2', [tenantId, id]);
    return rowCount > 0;
  },
  async directorsByCompany({ tenantId, companyId }) {
    const { rows } = await query(
      `SELECT d.* FROM directors d
       JOIN company_directors cd ON cd.director_id = d.id
       JOIN companies c ON c.id = cd.company_id
       WHERE c.id = $1 AND c.tenant_id = $2`,
      [companyId, tenantId]
    );
    return rows;
  }
>>>>>>> theirs
};
