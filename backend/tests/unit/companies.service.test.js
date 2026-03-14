import { jest } from '@jest/globals';
import { companiesService } from '../../src/modules/companies/services/companies.service.js';
import { companiesRepository } from '../../src/modules/companies/repositories/companies.repository.js';
import { auditService } from '../../src/modules/audit/services/audit.service.js';
import { logger } from '../../src/shared/utils/logger.js';

const companiesOriginal = { ...companiesRepository };
const auditOriginal = { ...auditService };
const loggerOriginal = { ...logger };

afterEach(() => {
  Object.assign(companiesRepository, companiesOriginal);
  Object.assign(auditService, auditOriginal);
  Object.assign(logger, loggerOriginal);
});

describe('companiesService', () => {
  test('tenant A cannot access tenant B company', async () => {
    companiesRepository.findById = jest.fn().mockResolvedValue(null);
    await expect(companiesService.getById({ requestId: 'req-1', tenantId: 'tenant-a', userId: 'user-1', role: 'viewer' }, { id: '55' })).rejects.toMatchObject({
      code: 'NOT_FOUND',
      status: 404
    });
  });

  test('company update writes audit log entries', async () => {
    companiesRepository.findById = jest.fn().mockResolvedValue({ id: '1', name: 'Old Co', status: 'active' });
    companiesRepository.update = jest.fn().mockResolvedValue({ id: '1', name: 'New Co', status: 'inactive' });
    auditService.log = jest.fn().mockResolvedValue(undefined);
    logger.info = jest.fn();

    await companiesService.update(
      { requestId: 'req-1', tenantId: 'tenant-a', userId: 'user-1', role: 'editor' },
      { id: '1', payload: { name: 'New Co', status: 'inactive' } }
    );

    expect(auditService.log).toHaveBeenCalledWith(expect.objectContaining({
      tenantId: 'tenant-a',
      entityType: 'company',
      entityId: '1',
      action: 'company.update',
      changedFields: ['name', 'status']
    }));
    expect(logger.info).toHaveBeenCalledWith('Company updated', expect.objectContaining({
      requestId: 'req-1',
      tenantId: 'tenant-a',
      userId: 'user-1',
      companyId: '1'
    }));
  });

  test('company create normalizes annual revenue before repository writes', async () => {
    companiesRepository.create = jest.fn().mockResolvedValue({ id: '1', name: 'Acme' });
    auditService.log = jest.fn().mockResolvedValue(undefined);
    logger.info = jest.fn();

    await companiesService.create(
      { requestId: 'req-1', tenantId: 'tenant-a', userId: 'user-1', role: 'editor' },
      { payload: { registrationNo: 'R1', name: 'Acme' } }
    );

    expect(companiesRepository.create).toHaveBeenCalledWith(expect.objectContaining({
      tenantId: 'tenant-a',
      userId: 'user-1',
      requestId: 'req-1'
    }), {
      registrationNo: 'R1',
      name: 'Acme',
      annualRevenue: null
    });
  });
});
