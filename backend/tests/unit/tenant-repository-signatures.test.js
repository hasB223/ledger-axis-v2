import fs from 'node:fs';

const companiesFile = fs.readFileSync(new URL('../../src/modules/companies/repositories/companies.repository.js', import.meta.url), 'utf8');
const analyticsServiceFile = fs.readFileSync(new URL('../../src/modules/analytics/services/analytics.service.js', import.meta.url), 'utf8');
const industrySummaryQueryFile = fs.readFileSync(new URL('../../src/modules/analytics/queries/industry-summary.query.js', import.meta.url), 'utf8');

describe('tenant repository signatures', () => {
  test('repository APIs accept request context while retaining explicit tenant scoping', () => {
    expect(companiesFile).toContain('findById(ctx, { id })');
    expect(companiesFile).toContain('list(ctx, { q, page, limit, industry, source, sortBy, sortOrder })');
    expect(companiesFile).toContain('ctx.tenantId');
    expect(companiesFile).not.toContain('findById(id)');
  });

  test('analytics reads are delegated to explicit query services', () => {
    expect(analyticsServiceFile).toContain('industrySummaryQuery.execute(ctx)');
    expect(analyticsServiceFile).toContain('topCompaniesQuery.execute(ctx)');
    expect(industrySummaryQueryFile).toContain('export const industrySummaryQuery');
  });
});
