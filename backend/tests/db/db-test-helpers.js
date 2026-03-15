import { query } from '../../src/shared/db/pool.js';

export const ctxFor = ({ tenantId, userId = null, role = 'viewer', requestId = 'db-test' }) => ({
  requestId,
  tenantId,
  userId,
  role
});

export async function resetDatabase() {
  await query('DELETE FROM watchlist_entries');
  await query('DELETE FROM company_directors');
  await query('DELETE FROM audit_logs');
  await query('DELETE FROM directors');
  await query('DELETE FROM companies');
  await query('DELETE FROM users');
  await query('DELETE FROM tenants');
}

export async function createTenant(name) {
  const { rows } = await query(
    'INSERT INTO tenants (name, created_at, updated_at) VALUES ($1, NOW(), NOW()) RETURNING id, name',
    [name]
  );
  return rows[0];
}

export async function createUser({ tenantId, email, role = 'viewer' }) {
  const { rows } = await query(
    `INSERT INTO users (tenant_id, email, full_name, role, password_hash, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
     RETURNING id, tenant_id AS "tenantId", email, role`,
    [tenantId, email, email, role, 'hash']
  );
  return rows[0];
}

export async function countCompaniesByRegistration({ tenantId, registrationNo }) {
  const { rows } = await query(
    'SELECT COUNT(*)::int AS count FROM companies WHERE tenant_id = $1 AND registration_no = $2',
    [tenantId, registrationNo]
  );
  return rows[0].count;
}
