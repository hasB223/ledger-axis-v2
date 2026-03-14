#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const {
  DEV_PASSWORD,
  ensureSchema,
  getTenantUsers,
  resetOwnedDataset,
  upsertTenant,
  upsertUser,
  withBackend
} = require('./lib/db-helpers');

const fixtureDirectory = path.join(__dirname, '..', 'backend', 'src', 'modules', 'ingestion', 'fixtures');
const baselinePath = path.join(fixtureDirectory, 'baseline.json');
const resyncPath = path.join(fixtureDirectory, 'resync.json');
const fixtureTenantName = 'LedgerAxis Ingestion Fixture';

withBackend(async (context) => {
  await ensureSchema(context);
  await resetOwnedDataset(context, {
    tenantNames: [fixtureTenantName],
    directorExternalRefPrefix: 'seed-ingestion:'
  });

  const tenant = await upsertTenant(context, { name: fixtureTenantName });
  const admin = await upsertUser(context, {
    tenantId: tenant.id,
    email: 'ingestion.fixture@ledgeraxis.local',
    fullName: 'Ingestion Fixture Admin',
    role: 'admin',
    password: DEV_PASSWORD
  });

  const { ingestionService } = await context.importBackend('src/modules/ingestion/services/ingestion.service.js');

  const payloads = [
    { name: 'baseline', data: JSON.parse(fs.readFileSync(baselinePath, 'utf8')) },
    { name: 'resync', data: JSON.parse(fs.readFileSync(resyncPath, 'utf8')) }
  ];

  const originalFetch = global.fetch;
  const results = [];

  try {
    for (const payload of payloads) {
      global.fetch = async () => ({
        ok: true,
        json: async () => payload.data
      });

      const result = await ingestionService.trigger({
        tenantId: tenant.id,
        userId: admin.id,
        role: 'admin',
        triggeredBy: `fixture:${payload.name}`
      });

      results.push({ name: payload.name, result });
    }
  } finally {
    global.fetch = originalFetch;
  }

  const auditRows = await context.query(
    `SELECT action, changed_fields, metadata, created_at
     FROM audit_logs
     WHERE tenant_id = $1 AND entity_type = 'company'
     ORDER BY created_at ASC`,
    [tenant.id]
  );

  console.log('Ingestion fixture run completed.');
  for (const entry of results) {
    console.log(`- ${entry.name}: processed=${entry.result.processed}, changed=${entry.result.changed}`);
  }
  console.log(`- audit rows: ${auditRows.rows.length}`);
  console.log(`- fixture users: ${JSON.stringify(await getTenantUsers(context, tenant.id))}`);
});
