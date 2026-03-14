import { query } from '../../../shared/db/pool.js';

export const ingestionRepository = {
  async upsertCompany(ctx, { registrationNo, name, industry, source, status, annualRevenue }) {
    const sql = `INSERT INTO companies (tenant_id, registration_no, name, industry, source, status, annual_revenue, created_at, updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),NOW())
      ON CONFLICT (tenant_id, registration_no)
      DO UPDATE SET name=EXCLUDED.name, industry=EXCLUDED.industry, source=EXCLUDED.source, status=EXCLUDED.status, annual_revenue=EXCLUDED.annual_revenue, updated_at=NOW()
      RETURNING id,
        tenant_id AS "tenantId",
        registration_no AS "registrationNo",
        name,
        industry,
        source,
        status,
        annual_revenue AS "annualRevenue"`;
    const { rows } = await query(sql, [ctx.tenantId, registrationNo, name, industry || null, source, status, annualRevenue ?? null]);
    return rows[0];
  },
  async findCompanyByRegistrationNo(ctx, { registrationNo }) {
    const { rows } = await query(
      `SELECT id,
        tenant_id AS "tenantId",
        registration_no AS "registrationNo",
        name,
        industry,
        source,
        status,
        annual_revenue AS "annualRevenue"
       FROM companies WHERE tenant_id=$1 AND registration_no=$2`,
      [ctx.tenantId, registrationNo]
    );
    return rows[0] || null;
  }
};
