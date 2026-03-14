import { jest } from '@jest/globals';
import { watchlistService } from '../../src/modules/watchlist/services/watchlist.service.js';
import { watchlistRepository } from '../../src/modules/watchlist/repositories/watchlist.repository.js';
import { companiesRepository } from '../../src/modules/companies/repositories/companies.repository.js';

const wlOriginal = { ...watchlistRepository };
const companiesOriginal = { ...companiesRepository };

afterEach(() => {
  Object.assign(watchlistRepository, wlOriginal);
  Object.assign(companiesRepository, companiesOriginal);
});

describe('watchlistService', () => {
  test('duplicate watchlist entry is rejected', async () => {
    companiesRepository.findById = jest.fn().mockResolvedValue({ id: 99 });
    watchlistRepository.findExisting = jest.fn().mockResolvedValue({ id: 1 });

    await expect(
      watchlistService.create(
        { requestId: 'req-1', tenantId: 'tenant-a', userId: 'user-1', role: 'viewer' },
        { payload: { companyId: 99, note: '' } }
      )
    ).rejects.toMatchObject({ code: 'CONFLICT', status: 409 });
  });

  test('missing company is rejected before insert', async () => {
    companiesRepository.findById = jest.fn().mockResolvedValue(null);
    watchlistRepository.findExisting = jest.fn();
    watchlistRepository.create = jest.fn();

    await expect(
      watchlistService.create(
        { requestId: 'req-1', tenantId: 'tenant-a', userId: 'user-1', role: 'viewer' },
        { payload: { companyId: 99, note: '' } }
      )
    ).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 });

    expect(watchlistRepository.findExisting).not.toHaveBeenCalled();
    expect(watchlistRepository.create).not.toHaveBeenCalled();
  });

  test('valid watchlist create still orchestrates repository calls', async () => {
    companiesRepository.findById = jest.fn().mockResolvedValue({ id: 99 });
    watchlistRepository.findExisting = jest.fn().mockResolvedValue(null);
    watchlistRepository.create = jest.fn().mockResolvedValue({ id: 1, company_id: 99 });

    const result = await watchlistService.create(
      { requestId: 'req-1', tenantId: 'tenant-a', userId: 'user-1', role: 'viewer' },
      { payload: { companyId: 99, note: 'Priority' } }
    );

    expect(watchlistRepository.create).toHaveBeenCalledWith(expect.objectContaining({
      requestId: 'req-1',
      tenantId: 'tenant-a',
      userId: 'user-1'
    }), {
      companyId: 99,
      note: 'Priority'
    });
    expect(result).toEqual({ id: 1, company_id: 99 });
  });
});
