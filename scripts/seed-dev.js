#!/usr/bin/env node

const {
  DEV_PASSWORD,
  addAuditLog,
  addWatchlistEntry,
  ensureSchema,
  linkDirectorToCompany,
  resetOwnedDataset,
  upsertCompany,
  upsertDirector,
  upsertTenant,
  upsertUser,
  withBackend
} = require('./lib/db-helpers');

const tenantNames = ['LedgerAxis Dev Alpha', 'LedgerAxis Dev Bravo', 'LedgerAxis Dev Sandbox'];

withBackend(async (context) => {
  await ensureSchema(context);
  await resetOwnedDataset(context, {
    tenantNames,
    directorExternalRefPrefix: 'seed-dev:'
  });

  const alpha = await upsertTenant(context, { name: tenantNames[0] });
  const bravo = await upsertTenant(context, { name: tenantNames[1] });
  const sandbox = await upsertTenant(context, { name: tenantNames[2] });

  const alphaUsers = {
    admin: await upsertUser(context, {
      tenantId: alpha.id,
      email: 'admin.alpha@ledgeraxis.local',
      fullName: 'Alpha Admin',
      role: 'admin',
      password: DEV_PASSWORD
    }),
    editor: await upsertUser(context, {
      tenantId: alpha.id,
      email: 'editor.alpha@ledgeraxis.local',
      fullName: 'Alpha Editor',
      role: 'editor',
      password: DEV_PASSWORD
    }),
    viewer: await upsertUser(context, {
      tenantId: alpha.id,
      email: 'viewer.alpha@ledgeraxis.local',
      fullName: 'Alpha Viewer',
      role: 'viewer',
      password: DEV_PASSWORD
    })
  };

  const bravoUsers = {
    admin: await upsertUser(context, {
      tenantId: bravo.id,
      email: 'admin.bravo@ledgeraxis.local',
      fullName: 'Bravo Admin',
      role: 'admin',
      password: DEV_PASSWORD
    }),
    viewer: await upsertUser(context, {
      tenantId: bravo.id,
      email: 'viewer.bravo@ledgeraxis.local',
      fullName: 'Bravo Viewer',
      role: 'viewer',
      password: DEV_PASSWORD
    })
  };

  await upsertUser(context, {
    tenantId: sandbox.id,
    email: 'admin.sandbox@ledgeraxis.local',
    fullName: 'Sandbox Admin',
    role: 'admin',
    password: DEV_PASSWORD
  });

  const alphaCompanies = {
    acme: await upsertCompany(context, {
      tenantId: alpha.id,
      registrationNo: 'DEV-A-001',
      name: 'Acme Advisory Sdn Bhd',
      industry: 'Consulting',
      source: 'manual',
      status: 'active',
      annualRevenue: 3250000
    }),
    harbor: await upsertCompany(context, {
      tenantId: alpha.id,
      registrationNo: 'DEV-A-002',
      name: 'Harbor Holdings Berhad',
      industry: 'Logistics',
      source: 'ssm_feed',
      status: 'active',
      annualRevenue: 7800000
    })
  };

  const bravoCompany = await upsertCompany(context, {
    tenantId: bravo.id,
    registrationNo: 'DEV-B-001',
    name: 'Bravo Bio Labs',
    industry: 'Healthcare',
    source: 'manual',
    status: 'inactive',
    annualRevenue: 1480000
  });

  const directors = {
    tan: await upsertDirector(context, { fullName: 'Tan Mei Ling', externalRef: 'seed-dev:tan-mei-ling' }),
    rahman: await upsertDirector(context, { fullName: 'Ahmad Rahman', externalRef: 'seed-dev:ahmad-rahman' }),
    wong: await upsertDirector(context, { fullName: 'Wong Kai Jun', externalRef: 'seed-dev:wong-kai-jun' }),
    sofia: await upsertDirector(context, { fullName: 'Sofia Iskandar', externalRef: 'seed-dev:sofia-iskandar' })
  };

  await linkDirectorToCompany(context, { companyId: alphaCompanies.acme.id, directorId: directors.tan.id });
  await linkDirectorToCompany(context, { companyId: alphaCompanies.acme.id, directorId: directors.rahman.id });
  await linkDirectorToCompany(context, { companyId: alphaCompanies.harbor.id, directorId: directors.rahman.id });
  await linkDirectorToCompany(context, { companyId: alphaCompanies.harbor.id, directorId: directors.wong.id });
  await linkDirectorToCompany(context, { companyId: bravoCompany.id, directorId: directors.sofia.id });

  await addWatchlistEntry(context, {
    tenantId: alpha.id,
    userId: alphaUsers.viewer.id,
    companyId: alphaCompanies.harbor.id,
    note: 'Track board changes'
  });
  await addWatchlistEntry(context, {
    tenantId: alpha.id,
    userId: alphaUsers.admin.id,
    companyId: alphaCompanies.acme.id,
    note: 'Demo home screen'
  });
  await addWatchlistEntry(context, {
    tenantId: bravo.id,
    userId: bravoUsers.viewer.id,
    companyId: bravoCompany.id,
    note: 'Tenant isolation walkthrough'
  });

  await addAuditLog(context, {
    tenantId: alpha.id,
    entityType: 'company',
    entityId: alphaCompanies.acme.id,
    action: 'company.create',
    changedFields: ['registrationNo', 'name', 'industry', 'source', 'status', 'annualRevenue'],
    actorUserId: alphaUsers.admin.id,
    metadata: { seed: 'dev' }
  });
  await addAuditLog(context, {
    tenantId: alpha.id,
    entityType: 'company',
    entityId: alphaCompanies.harbor.id,
    action: 'company.update',
    changedFields: ['source', 'annualRevenue'],
    actorUserId: alphaUsers.editor.id,
    metadata: { seed: 'dev' }
  });
  await addAuditLog(context, {
    tenantId: bravo.id,
    entityType: 'company',
    entityId: bravoCompany.id,
    action: 'company.create',
    changedFields: ['registrationNo', 'name', 'industry', 'source', 'status', 'annualRevenue'],
    actorUserId: bravoUsers.admin.id,
    metadata: { seed: 'dev' }
  });

  console.log('Dev seed completed.');
  console.log('Credentials:');
  console.log(`- admin.alpha@ledgeraxis.local / ${DEV_PASSWORD}`);
  console.log(`- editor.alpha@ledgeraxis.local / ${DEV_PASSWORD}`);
  console.log(`- viewer.alpha@ledgeraxis.local / ${DEV_PASSWORD}`);
  console.log(`- admin.bravo@ledgeraxis.local / ${DEV_PASSWORD}`);
  console.log(`- viewer.bravo@ledgeraxis.local / ${DEV_PASSWORD}`);
});
