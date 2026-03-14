import { ingestionDomainService } from '../../src/modules/ingestion/domain/ingestion-domain.service.js';

describe('ingestionDomainService', () => {
  test('extracts companies from array and object payloads', () => {
    expect(ingestionDomainService.extractCompanies([{ registrationNo: 'R1' }])).toEqual([{ registrationNo: 'R1' }]);
    expect(ingestionDomainService.extractCompanies({ companies: [{ registrationNo: 'R2' }] })).toEqual([{ registrationNo: 'R2' }]);
  });

  test('normalizes source payload defaults', () => {
    expect(
      ingestionDomainService.normalizeCompany({
        registrationNo: 'R1',
        name: 'Acme'
      })
    ).toEqual({
      registrationNo: 'R1',
      name: 'Acme',
      industry: null,
      source: 'registry',
      status: 'active',
      annualRevenue: null
    });
  });

  test('builds create and update diffs consistently', () => {
    expect(
      ingestionDomainService.getChangedFields(null, {
        name: 'Acme',
        industry: 'Tech',
        source: 'registry',
        status: 'active',
        annualRevenue: 1000
      })
    ).toEqual(['name', 'industry', 'source', 'status', 'annualRevenue']);

    expect(
      ingestionDomainService.getChangedFields(
        {
          name: 'Acme',
          industry: 'Tech',
          source: 'registry',
          status: 'active',
          annualRevenue: 1000
        },
        {
          name: 'Acme Holdings',
          industry: 'Tech',
          source: 'registry',
          status: 'inactive',
          annualRevenue: 1000
        }
      )
    ).toEqual(['name', 'status']);
  });

  test('treats unchanged re-sync data as a no-op', () => {
    const normalizedCompany = {
      registrationNo: 'R1',
      name: 'Acme',
      industry: 'Tech',
      source: 'registry',
      status: 'active',
      annualRevenue: 1000
    };

    expect(ingestionDomainService.shouldUpsert(normalizedCompany, normalizedCompany)).toBe(false);
    expect(
      ingestionDomainService.buildAuditEvent({
        tenantId: 'tenant-a',
        actorUserId: 'u1',
        companyId: 'c1',
        before: normalizedCompany,
        normalizedCompany,
        triggeredBy: 'manual'
      })
    ).toBeNull();
  });

  test('shapes ingestion audit metadata for changed records', () => {
    expect(
      ingestionDomainService.buildAuditEvent({
        tenantId: 'tenant-a',
        actorUserId: 'u1',
        companyId: 'c1',
        before: null,
        normalizedCompany: {
          registrationNo: 'R1',
          name: 'Acme',
          industry: null,
          source: 'registry',
          status: 'active',
          annualRevenue: null
        },
        triggeredBy: 'scheduler'
      })
    ).toEqual({
      tenantId: 'tenant-a',
      entityType: 'company',
      entityId: 'c1',
      action: 'ingestion.create',
      changedFields: ['name', 'industry', 'source', 'status', 'annualRevenue'],
      actorUserId: 'u1',
      metadata: { triggeredBy: 'scheduler' }
    });
  });
});
