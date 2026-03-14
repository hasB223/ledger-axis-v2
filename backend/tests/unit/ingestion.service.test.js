import { jest } from '@jest/globals';
import { ingestionService } from '../../src/modules/ingestion/services/ingestion.service.js';
import { ingestionRepository } from '../../src/modules/ingestion/repositories/ingestion.repository.js';
import { auditService } from '../../src/modules/audit/services/audit.service.js';
import { logger } from '../../src/shared/utils/logger.js';

const ingestionOriginal = { ...ingestionRepository };
const auditOriginal = { ...auditService };
const loggerOriginal = { ...logger };

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  Object.assign(ingestionRepository, ingestionOriginal);
  Object.assign(auditService, auditOriginal);
  Object.assign(logger, loggerOriginal);
  jest.restoreAllMocks();
});

describe('ingestionService', () => {
  test('admin can trigger ingestion', async () => {
    fetch.mockResolvedValue({ ok: true, json: async () => ({ companies: [] }) });
    logger.info = jest.fn();
    const result = await ingestionService.trigger(
      { requestId: 'req-1', tenantId: 't1', userId: 'u1', role: 'admin' },
      { triggeredBy: 'manual' }
    );
    expect(result).toMatchObject({ processed: 0, changed: 0 });
  });

  test('ingestion re-sync updates changed fields and writes audit logs', async () => {
    fetch.mockResolvedValue({ ok: true, json: async () => ({ companies: [{ registrationNo: 'R1', name: 'New', industry: 'Tech', source: 'registry', status: 'active' }] }) });
    ingestionRepository.findCompanyByRegistrationNo = jest.fn().mockResolvedValue({ id: 7, name: 'Old', industry: 'Legacy', source: 'legacy', status: 'inactive' });
    ingestionRepository.upsertCompany = jest.fn().mockResolvedValue({ id: 7, registrationNo: 'R1', name: 'New', industry: 'Tech', source: 'registry', status: 'active', annualRevenue: null });
    auditService.log = jest.fn().mockResolvedValue(undefined);
    logger.info = jest.fn().mockResolvedValue(undefined);

    const result = await ingestionService.trigger(
      { requestId: 'req-1', tenantId: 't1', userId: 'u1', role: 'admin' },
      { triggeredBy: 'manual' }
    );

    expect(result.changed).toBe(1);
    expect(ingestionRepository.upsertCompany).toHaveBeenCalledWith(expect.objectContaining({
      requestId: 'req-1',
      tenantId: 't1',
      userId: 'u1'
    }), expect.any(Object));
    expect(auditService.log).toHaveBeenCalledWith(expect.objectContaining({
      action: 'ingestion.update',
      changedFields: expect.arrayContaining(['name', 'industry', 'source', 'status'])
    }));
    expect(logger.info).toHaveBeenCalledWith('Ingestion completed', expect.objectContaining({
      requestId: 'req-1',
      tenantId: 't1',
      triggeredBy: 'manual',
      processed: 1,
      changed: 1
    }));
  });

  test('ingestion re-sync skips unchanged rows', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        companies: [{ registrationNo: 'R1', name: 'Stable', industry: 'Tech', source: 'registry', status: 'active', annualRevenue: 5000 }]
      })
    });
    ingestionRepository.findCompanyByRegistrationNo = jest.fn().mockResolvedValue({
      id: 7,
      registrationNo: 'R1',
      name: 'Stable',
      industry: 'Tech',
      source: 'registry',
      status: 'active',
      annualRevenue: 5000
    });
    ingestionRepository.upsertCompany = jest.fn();
    auditService.log = jest.fn();
    logger.info = jest.fn();

    const result = await ingestionService.trigger(
      { requestId: 'req-1', tenantId: 't1', userId: 'u1', role: 'admin' },
      { triggeredBy: 'manual' }
    );

    expect(result).toMatchObject({ processed: 1, changed: 0, dryRun: false });
    expect(ingestionRepository.upsertCompany).not.toHaveBeenCalled();
    expect(auditService.log).not.toHaveBeenCalled();
  });
});
