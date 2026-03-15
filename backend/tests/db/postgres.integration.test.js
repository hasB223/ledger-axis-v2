import { query } from '../../src/shared/db/pool.js';
import { companiesRepository } from '../../src/modules/companies/repositories/companies.repository.js';
import { watchlistRepository } from '../../src/modules/watchlist/repositories/watchlist.repository.js';
import { ingestionRepository } from '../../src/modules/ingestion/repositories/ingestion.repository.js';
import { industrySummaryQuery } from '../../src/modules/analytics/queries/industry-summary.query.js';
import {
  countCompaniesByRegistration,
  createTenant,
  createUser,
  ctxFor,
  resetDatabase
} from './db-test-helpers.js';

describe('PostgreSQL-backed integration behavior', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  test('migrations apply the expected core tables', async () => {
    const { rows } = await query(
      `SELECT table_name
       FROM information_schema.tables
       WHERE table_schema = current_schema()
         AND table_name = ANY($1::text[])
       ORDER BY table_name`,
      [['audit_logs', 'companies', 'company_directors', 'directors', 'tenants', 'users', 'watchlist_entries']]
    );

    expect(rows.map((row) => row.table_name)).toEqual([
      'audit_logs',
      'companies',
      'company_directors',
      'directors',
      'tenants',
      'users',
      'watchlist_entries'
    ]);
  });

  test('tenant-scoped company repository reads and writes honor tenant filtering', async () => {
    const tenantA = await createTenant('Tenant A');
    const tenantB = await createTenant('Tenant B');
    const ctxA = ctxFor({ tenantId: tenantA.id, userId: 'u-a' });
    const ctxB = ctxFor({ tenantId: tenantB.id, userId: 'u-b' });

    const companyA = await companiesRepository.create(ctxA, {
      registrationNo: 'A-100',
      name: 'Alpha Co',
      industry: 'Tech',
      source: 'manual',
      status: 'active',
      annualRevenue: 1000
    });
    const companyB = await companiesRepository.create(ctxB, {
      registrationNo: 'B-100',
      name: 'Bravo Co',
      industry: 'Finance',
      source: 'manual',
      status: 'active',
      annualRevenue: 2000
    });

    await expect(companiesRepository.findById(ctxA, { id: companyA.id })).resolves.toMatchObject({ id: companyA.id });
    await expect(companiesRepository.findById(ctxA, { id: companyB.id })).resolves.toBeNull();

    const updated = await companiesRepository.update(ctxA, {
      id: companyA.id,
      patch: { name: 'Alpha Co Updated' }
    });
    const blockedUpdate = await companiesRepository.update(ctxA, {
      id: companyB.id,
      patch: { name: 'Should Not Change' }
    });

    expect(updated).toMatchObject({ id: companyA.id, name: 'Alpha Co Updated' });
    expect(blockedUpdate).toBeNull();
  });

  test('watchlist unique constraint is enforced by PostgreSQL', async () => {
    const tenant = await createTenant('Watchlist Tenant');
    const user = await createUser({ tenantId: tenant.id, email: 'watcher@example.com' });
    const ctx = ctxFor({ tenantId: tenant.id, userId: user.id });
    const company = await companiesRepository.create(ctx, {
      registrationNo: 'W-100',
      name: 'Watched Co',
      industry: 'Tech',
      source: 'manual',
      status: 'active',
      annualRevenue: null
    });

    await watchlistRepository.create(ctx, { companyId: company.id, note: 'Track' });

    await expect(watchlistRepository.create(ctx, { companyId: company.id, note: 'Track again' })).rejects.toMatchObject({
      code: '23505'
    });
  });

  test('ingestion upsert uses ON CONFLICT to update the existing company row', async () => {
    const tenant = await createTenant('Ingestion Tenant');
    const ctx = ctxFor({ tenantId: tenant.id, userId: 'ingestion-user', role: 'admin' });

    const first = await ingestionRepository.upsertCompany(ctx, {
      registrationNo: 'I-100',
      name: 'Initial Name',
      industry: 'Tech',
      source: 'registry',
      status: 'active',
      annualRevenue: 1000
    });

    const second = await ingestionRepository.upsertCompany(ctx, {
      registrationNo: 'I-100',
      name: 'Updated Name',
      industry: 'Tech',
      source: 'registry',
      status: 'inactive',
      annualRevenue: 5000
    });

    expect(second.id).toBe(first.id);
    expect(second).toMatchObject({ name: 'Updated Name', status: 'inactive', annualRevenue: '5000.00' });
    await expect(countCompaniesByRegistration({ tenantId: tenant.id, registrationNo: 'I-100' })).resolves.toBe(1);
  });

  test('industry summary analytics query aggregates seeded tenant data correctly', async () => {
    const tenantA = await createTenant('Analytics Tenant A');
    const tenantB = await createTenant('Analytics Tenant B');
    const ctxA = ctxFor({ tenantId: tenantA.id });
    const ctxB = ctxFor({ tenantId: tenantB.id });

    await companiesRepository.create(ctxA, {
      registrationNo: 'AN-1',
      name: 'Alpha Analytics',
      industry: 'Tech',
      source: 'manual',
      status: 'active',
      annualRevenue: null
    });
    await companiesRepository.create(ctxA, {
      registrationNo: 'AN-2',
      name: 'Beta Analytics',
      industry: 'Tech',
      source: 'manual',
      status: 'active',
      annualRevenue: null
    });
    await companiesRepository.create(ctxA, {
      registrationNo: 'AN-3',
      name: 'Gamma Analytics',
      industry: 'Finance',
      source: 'manual',
      status: 'active',
      annualRevenue: null
    });
    await companiesRepository.create(ctxB, {
      registrationNo: 'BN-1',
      name: 'Other Tenant Co',
      industry: 'Tech',
      source: 'manual',
      status: 'active',
      annualRevenue: null
    });

    await expect(industrySummaryQuery.execute(ctxA)).resolves.toEqual([
      { industry: 'Tech', count: 2 },
      { industry: 'Finance', count: 1 }
    ]);
  });
});
