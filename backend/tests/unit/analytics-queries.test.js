import { jest } from '@jest/globals';

const mockQuery = jest.fn();

jest.unstable_mockModule('../../src/shared/db/pool.js', () => ({
  query: mockQuery
}));

const { industrySummaryQuery } = await import('../../src/modules/analytics/queries/industry-summary.query.js');
const { topCompaniesQuery } = await import('../../src/modules/analytics/queries/top-companies.query.js');
const { directorOverlapQuery } = await import('../../src/modules/analytics/queries/director-overlap.query.js');
const { sourceDistributionQuery } = await import('../../src/modules/analytics/queries/source-distribution.query.js');
const { revenueDistributionQuery } = await import('../../src/modules/analytics/queries/revenue-distribution.query.js');

afterEach(() => {
  mockQuery.mockReset();
});

describe('analytics query services', () => {
  const ctx = { requestId: 'req-1', tenantId: 'tenant-a', userId: 'user-1', role: 'viewer' };

  test('industry summary query enforces tenant filtering and maps rows', async () => {
    mockQuery.mockResolvedValue({ rows: [{ industry: 'Technology', count: 4 }] });

    await expect(industrySummaryQuery.execute(ctx)).resolves.toEqual([{ industry: 'Technology', count: 4 }]);
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('WHERE tenant_id = $1'), ['tenant-a']);
  });

  test('top companies query uses tenant-scoped aggregation and preserves response shape', async () => {
    mockQuery.mockResolvedValue({ rows: [{ id: 7, name: 'Acme', director_count: 3 }] });

    await expect(topCompaniesQuery.execute(ctx)).resolves.toEqual([{ id: 7, name: 'Acme', director_count: 3 }]);
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('LEFT JOIN company_directors'), ['tenant-a']);
  });

  test('director overlap query filters to tenant-visible companies only', async () => {
    mockQuery.mockResolvedValue({ rows: [{ director_id: 11, full_name: 'Dana Lee', companies_count: 2 }] });

    await expect(directorOverlapQuery.execute(ctx)).resolves.toEqual([
      { director_id: 11, full_name: 'Dana Lee', companies_count: 2 }
    ]);
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('WHERE c.tenant_id = $1'), ['tenant-a']);
  });

  test('source distribution query groups sources within the tenant', async () => {
    mockQuery.mockResolvedValue({ rows: [{ source: 'manual', count: 5 }] });

    await expect(sourceDistributionQuery.execute(ctx)).resolves.toEqual([{ source: 'manual', count: 5 }]);
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('GROUP BY source'), ['tenant-a']);
  });

  test('revenue distribution query returns revenue bands for the tenant', async () => {
    mockQuery.mockResolvedValue({ rows: [{ band: '1m_to_10m', count: 2 }] });

    await expect(revenueDistributionQuery.execute(ctx)).resolves.toEqual([{ band: '1m_to_10m', count: 2 }]);
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining("WHEN annual_revenue < 10000000 THEN '1m_to_10m'"), ['tenant-a']);
  });
});
