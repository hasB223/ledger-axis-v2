import { companiesService } from '../../src/modules/companies/services/companies.service.js';
import { companiesRepository } from '../../src/modules/companies/repositories/companies.repository.js';
import { auditService } from '../../src/modules/audit/services/audit.service.js';

const companiesOriginal = { ...companiesRepository };
const auditOriginal = { ...auditService };

afterEach(() => {
  Object.assign(companiesRepository, companiesOriginal);
  Object.assign(auditService, auditOriginal);
});

describe('companiesService', () => {
  test('tenant A cannot access tenant B company', async () => {
    companiesRepository.findById = jest.fn().mockResolvedValue(null);
    await expect(companiesService.getById({ tenantId: 'tenant-a', id: '55' })).rejects.toMatchObject({
      code: 'NOT_FOUND',
      status: 404
    });
  });

  test('company update writes audit log entries', async () => {
    companiesRepository.findById = jest.fn().mockResolvedValue({ id: '1', name: 'Old Co', status: 'active' });
    companiesRepository.update = jest.fn().mockResolvedValue({ id: '1', name: 'New Co', status: 'inactive' });
    auditService.log = jest.fn().mockResolvedValue(undefined);

    await companiesService.update({
      tenantId: 'tenant-a',
      id: '1',
      payload: { name: 'New Co', status: 'inactive' },
      userId: 'user-1'
    });

    expect(auditService.log).toHaveBeenCalledWith(expect.objectContaining({
      tenantId: 'tenant-a',
      entityType: 'company',
      entityId: '1',
      action: 'company.update',
      changedFields: ['name', 'status']
    }));
  });
});
