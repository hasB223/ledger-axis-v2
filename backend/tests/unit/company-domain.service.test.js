import { companyDomainService } from '../../src/modules/companies/domain/company-domain.service.js';

describe('companyDomainService', () => {
  test('normalizes annual revenue for create payloads', () => {
    expect(
      companyDomainService.normalizeCreatePayload({
        registrationNo: 'R-1',
        name: 'Acme Holdings'
      })
    ).toEqual({
      registrationNo: 'R-1',
      name: 'Acme Holdings',
      annualRevenue: null
    });
  });

  test('maps annualRevenue to repository patch field on update', () => {
    expect(
      companyDomainService.normalizeUpdatePayload({
        name: 'Acme Holdings 2',
        annualRevenue: 2500000
      })
    ).toEqual({
      name: 'Acme Holdings 2',
      annual_revenue: 2500000
    });
  });

  test('detects changed fields for audit logging', () => {
    expect(
      companyDomainService.getChangedFields(
        { name: 'Old Co', status: 'active', annualRevenue: 1000 },
        { name: 'New Co', status: 'active', annualRevenue: 2000 }
      )
    ).toEqual(['name', 'annualRevenue']);
  });

  test('builds create, update, and delete audit events', () => {
    expect(
      companyDomainService.buildCreateAuditEvent({
        tenantId: 'tenant-a',
        companyId: 'c1',
        actorUserId: 'u1',
        payload: { name: 'Acme', source: 'manual' }
      })
    ).toEqual({
      tenantId: 'tenant-a',
      entityType: 'company',
      entityId: 'c1',
      action: 'company.create',
      changedFields: ['name', 'source'],
      actorUserId: 'u1'
    });

    expect(
      companyDomainService.buildUpdateAuditEvent({
        tenantId: 'tenant-a',
        companyId: 'c1',
        actorUserId: 'u1',
        before: { name: 'Old', status: 'active' },
        payload: { name: 'New', status: 'active' }
      })
    ).toEqual({
      tenantId: 'tenant-a',
      entityType: 'company',
      entityId: 'c1',
      action: 'company.update',
      changedFields: ['name'],
      actorUserId: 'u1'
    });

    expect(
      companyDomainService.buildDeleteAuditEvent({
        tenantId: 'tenant-a',
        companyId: 'c1',
        actorUserId: 'u1'
      })
    ).toEqual({
      tenantId: 'tenant-a',
      entityType: 'company',
      entityId: 'c1',
      action: 'company.delete',
      changedFields: [],
      actorUserId: 'u1'
    });
  });
});
