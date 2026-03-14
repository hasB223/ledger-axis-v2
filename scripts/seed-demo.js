#!/usr/bin/env node

const { createRequire } = require('module');
const path = require('path');
const {
  DEMO_PASSWORD,
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

const backendRequire = createRequire(path.join(__dirname, '..', 'backend', 'package.json'));
const fakerModulePromise = import(backendRequire.resolve('@faker-js/faker'));

const tenantNames = ['LedgerAxis Demo Primary', 'LedgerAxis Demo Secondary'];
const industries = ['Technology', 'Manufacturing', 'Logistics', 'Healthcare', 'Energy', 'Finance', 'Retail'];

withBackend(async (context) => {
  const { faker } = await fakerModulePromise;
  faker.seed(20260314);

  await ensureSchema(context);
  await resetOwnedDataset(context, {
    tenantNames,
    directorExternalRefPrefix: 'seed-demo:'
  });

  const primaryTenant = await upsertTenant(context, { name: tenantNames[0] });
  const secondaryTenant = await upsertTenant(context, { name: tenantNames[1] });

  const primaryUsers = {
    admin: await upsertUser(context, {
      tenantId: primaryTenant.id,
      email: 'admin.demo@ledgeraxis.local',
      fullName: 'Demo Admin',
      role: 'admin',
      password: DEMO_PASSWORD
    }),
    editor: await upsertUser(context, {
      tenantId: primaryTenant.id,
      email: 'editor.demo@ledgeraxis.local',
      fullName: 'Demo Editor',
      role: 'editor',
      password: DEMO_PASSWORD
    }),
    viewer: await upsertUser(context, {
      tenantId: primaryTenant.id,
      email: 'viewer.demo@ledgeraxis.local',
      fullName: 'Demo Viewer',
      role: 'viewer',
      password: DEMO_PASSWORD
    })
  };

  await upsertUser(context, {
    tenantId: secondaryTenant.id,
    email: 'viewer.secondary@ledgeraxis.local',
    fullName: 'Secondary Viewer',
    role: 'viewer',
    password: DEMO_PASSWORD
  });

  const directorPool = [];

  for (let index = 0; index < 90; index += 1) {
    const director = await upsertDirector(context, {
      fullName: faker.person.fullName(),
      externalRef: `seed-demo:director:${index.toString().padStart(3, '0')}`
    });
    directorPool.push(director);
  }

  const sharedDirectors = directorPool.slice(0, 10);
  const primaryCompanies = [];

  for (let index = 0; index < 72; index += 1) {
    const source = index % 3 === 0 ? 'manual' : 'ssm_feed';
    const industry = industries[index % industries.length];
    const company = await upsertCompany(context, {
      tenantId: primaryTenant.id,
      registrationNo: `DEMO-P-${(index + 1).toString().padStart(4, '0')}`,
      name: faker.company.name(),
      industry,
      source,
      status: index % 9 === 0 ? 'inactive' : 'active',
      annualRevenue: Number(faker.finance.amount({ min: 350000, max: 150000000, dec: 2 }))
    });

    primaryCompanies.push(company);

    const localDirectors = [
      directorPool[(index + 5) % directorPool.length],
      directorPool[(index + 17) % directorPool.length]
    ];

    if (index % 4 === 0) {
      localDirectors.push(sharedDirectors[index % sharedDirectors.length]);
    }

    if (index % 7 === 0) {
      localDirectors.push(sharedDirectors[(index + 3) % sharedDirectors.length]);
    }

    for (const director of localDirectors) {
      await linkDirectorToCompany(context, { companyId: company.id, directorId: director.id });
    }

    if (index < 18) {
      await addAuditLog(context, {
        tenantId: primaryTenant.id,
        entityType: 'company',
        entityId: company.id,
        action: index % 2 === 0 ? 'company.create' : 'company.update',
        changedFields: index % 2 === 0 ? ['registrationNo', 'name', 'industry', 'source', 'status', 'annualRevenue'] : ['industry', 'annualRevenue'],
        actorUserId: index % 2 === 0 ? primaryUsers.admin.id : primaryUsers.editor.id,
        metadata: { seed: 'demo', batch: 'primary' }
      });
    }
  }

  for (let index = 0; index < 24; index += 1) {
    const company = await upsertCompany(context, {
      tenantId: secondaryTenant.id,
      registrationNo: `DEMO-S-${(index + 1).toString().padStart(4, '0')}`,
      name: faker.company.name(),
      industry: industries[(index + 2) % industries.length],
      source: index % 2 === 0 ? 'manual' : 'ssm_feed',
      status: 'active',
      annualRevenue: Number(faker.finance.amount({ min: 500000, max: 45000000, dec: 2 }))
    });

    await linkDirectorToCompany(context, {
      companyId: company.id,
      directorId: directorPool[(index + 11) % directorPool.length].id
    });
  }

  for (const company of primaryCompanies.slice(0, 12)) {
    await addWatchlistEntry(context, {
      tenantId: primaryTenant.id,
      userId: primaryUsers.viewer.id,
      companyId: company.id,
      note: 'Manual QA watchlist'
    });
  }

  console.log('Demo seed completed.');
  console.log(`Primary demo credentials: admin.demo@ledgeraxis.local / ${DEMO_PASSWORD}`);
  console.log(`Dataset: ${primaryCompanies.length} primary-tenant companies plus 24 secondary-tenant companies.`);
});
