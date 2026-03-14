import { query } from '../../../shared/db/pool.js';

const sortColumns = { name: 'name', created_at: 'created_at', updated_at: 'updated_at' };
const companySelect = `id,
  tenant_id AS "tenantId",
  registration_no AS "registrationNo",
  name,
  industry,
  source,
  status,
  annual_revenue AS "annualRevenue",
  created_at AS "createdAt",
  updated_at AS "updatedAt"`;

export const companiesRepository = {
  async list(ctx, { q, page, limit, industry, source, sortBy, sortOrder }) {
    const conditions = ['tenant_id = $1'];
    const params = [ctx.tenantId];
    if (q) { params.push(`%${q}%`); conditions.push(`(name ILIKE $${params.length} OR registration_no ILIKE $${params.length})`); }
    if (industry) { params.push(industry); conditions.push(`industry = $${params.length}`); }
    if (source) { params.push(source); conditions.push(`source = $${params.length}`); }
    const offset = (page - 1) * limit;
    params.push(limit, offset);
    const column = sortColumns[sortBy] || 'updated_at';
    const order = sortOrder === 'asc' ? 'ASC' : 'DESC';

    const sql = `SELECT ${companySelect}
      FROM companies WHERE ${conditions.join(' AND ')}
      ORDER BY ${column} ${order} LIMIT $${params.length - 1} OFFSET $${params.length}`;
    const rows = await query(sql, params);
    return rows.rows;
  },
  async findById(ctx, { id }) {
    const { rows } = await query(`SELECT ${companySelect} FROM companies WHERE tenant_id = $1 AND id = $2`, [ctx.tenantId, id]);
    return rows[0] || null;
  },
  async create(ctx, { registrationNo, name, industry, source, status, annualRevenue }) {
    const sql = `INSERT INTO companies (tenant_id, registration_no, name, industry, source, status, annual_revenue, created_at, updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),NOW())
      RETURNING ${companySelect}`;
    const { rows } = await query(sql, [ctx.tenantId, registrationNo, name, industry || null, source, status, annualRevenue ?? null]);
    return rows[0];
  },
  async update(ctx, { id, patch }) {
    const keys = Object.keys(patch);
    const setSql = keys.map((k, i) => `${k} = $${i + 3}`).join(', ');
    const params = [ctx.tenantId, id, ...keys.map((k) => patch[k])];
    const sql = `UPDATE companies SET ${setSql}, updated_at = NOW() WHERE tenant_id = $1 AND id = $2 RETURNING ${companySelect}`;
    const { rows } = await query(sql, params);
    return rows[0] || null;
  },
  async remove(ctx, { id }) {
    const { rowCount } = await query('DELETE FROM companies WHERE tenant_id = $1 AND id = $2', [ctx.tenantId, id]);
    return rowCount > 0;
  },
  async directorsByCompany(ctx, { companyId }) {
    const { rows } = await query(
      `SELECT d.* FROM directors d
       JOIN company_directors cd ON cd.director_id = d.id
       JOIN companies c ON c.id = cd.company_id
       WHERE c.id = $1 AND c.tenant_id = $2`,
      [companyId, ctx.tenantId]
    );
    return rows;
  }
};
