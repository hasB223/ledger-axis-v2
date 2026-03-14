const { getBackendContext } = require('./runtime');

const DEV_PASSWORD = 'LedgerAxis123!';
const DEMO_PASSWORD = 'LedgerAxisDemo123!';

async function withBackend(task) {
  const context = await getBackendContext();

  try {
    return await task(context);
  } finally {
    await context.pool.end();
  }
}

async function ensureSchema(context) {
  const { runMigrations } = await context.importBackend('src/shared/db/migrate.js');
  await runMigrations({ direction: 'up', schema: context.env.pg.schema });
}

async function resetOwnedDataset(context, { tenantNames, directorExternalRefPrefix }) {
  await context.query('BEGIN');

  try {
    if (Array.isArray(tenantNames) && tenantNames.length > 0) {
      await context.query('DELETE FROM tenants WHERE name = ANY($1::text[])', [tenantNames]);
    }

    if (directorExternalRefPrefix) {
      await context.query('DELETE FROM directors WHERE external_ref LIKE $1', [`${directorExternalRefPrefix}%`]);
    }

    await context.query('COMMIT');
  } catch (error) {
    await context.query('ROLLBACK');
    throw error;
  }
}

async function hashPassword(context, password) {
  const bcrypt = context.requireFromBackend('bcrypt');
  return bcrypt.hash(password, Number(context.env.bcryptSaltRounds));
}

async function upsertTenant(context, { name }) {
  const { rows } = await context.query(
    `INSERT INTO tenants (name, created_at, updated_at)
     VALUES ($1, NOW(), NOW())
     ON CONFLICT (name)
     DO UPDATE SET updated_at = NOW()
     RETURNING id, name`,
    [name]
  );

  return rows[0];
}

async function upsertUser(context, { tenantId, email, fullName, role, password }) {
  const passwordHash = await hashPassword(context, password);
  const { rows } = await context.query(
    `INSERT INTO users (tenant_id, email, full_name, role, password_hash, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
     ON CONFLICT (email)
     DO UPDATE SET
       tenant_id = EXCLUDED.tenant_id,
       full_name = EXCLUDED.full_name,
       role = EXCLUDED.role,
       password_hash = EXCLUDED.password_hash,
       updated_at = NOW()
     RETURNING id, tenant_id AS "tenantId", email, full_name AS "fullName", role`,
    [tenantId, email.toLowerCase(), fullName, role, passwordHash]
  );

  return rows[0];
}

async function upsertCompany(context, { tenantId, registrationNo, name, industry, source, status, annualRevenue }) {
  const { rows } = await context.query(
    `INSERT INTO companies (tenant_id, registration_no, name, industry, source, status, annual_revenue, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
     ON CONFLICT (tenant_id, registration_no)
     DO UPDATE SET
       name = EXCLUDED.name,
       industry = EXCLUDED.industry,
       source = EXCLUDED.source,
       status = EXCLUDED.status,
       annual_revenue = EXCLUDED.annual_revenue,
       updated_at = NOW()
     RETURNING id,
       tenant_id AS "tenantId",
       registration_no AS "registrationNo",
       name,
       industry,
       source,
       status,
       annual_revenue AS "annualRevenue"`,
    [tenantId, registrationNo, name, industry ?? null, source, status ?? 'active', annualRevenue ?? null]
  );

  return rows[0];
}

async function upsertDirector(context, { fullName, externalRef }) {
  const { rows } = await context.query(
    `INSERT INTO directors (full_name, external_ref, created_at, updated_at)
     VALUES ($1, $2, NOW(), NOW())
     ON CONFLICT (external_ref)
     DO UPDATE SET
       full_name = EXCLUDED.full_name,
       updated_at = NOW()
     RETURNING id, full_name AS "fullName", external_ref AS "externalRef"`,
    [fullName, externalRef]
  );

  return rows[0];
}

async function linkDirectorToCompany(context, { companyId, directorId }) {
  await context.query(
    `INSERT INTO company_directors (company_id, director_id, created_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (company_id, director_id) DO NOTHING`,
    [companyId, directorId]
  );
}

async function addWatchlistEntry(context, { tenantId, userId, companyId, note }) {
  await context.query(
    `INSERT INTO watchlist_entries (tenant_id, user_id, company_id, note, created_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (tenant_id, user_id, company_id)
     DO UPDATE SET note = EXCLUDED.note`,
    [tenantId, userId, companyId, note ?? null]
  );
}

async function addAuditLog(context, { tenantId, entityType, entityId, action, changedFields, actorUserId, metadata = {} }) {
  await context.query(
    `INSERT INTO audit_logs (tenant_id, entity_type, entity_id, action, changed_fields, actor_user_id, metadata, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, NOW())`,
    [tenantId, entityType, String(entityId), action, changedFields, actorUserId ?? null, JSON.stringify(metadata)]
  );
}

async function getTenantUsers(context, tenantId) {
  const { rows } = await context.query(
    'SELECT id, email, role FROM users WHERE tenant_id = $1 ORDER BY role, email',
    [tenantId]
  );

  return rows;
}

module.exports = {
  DEV_PASSWORD,
  DEMO_PASSWORD,
  addAuditLog,
  addWatchlistEntry,
  ensureSchema,
  getTenantUsers,
  linkDirectorToCompany,
  resetOwnedDataset,
  upsertCompany,
  upsertDirector,
  upsertTenant,
  upsertUser,
  withBackend
};
