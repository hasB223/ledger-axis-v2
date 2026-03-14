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

    await expect(watchlistService.create({
      tenantId: 'tenant-a',
      userId: 'user-1',
      payload: { companyId: 99, note: '' }
    })).rejects.toMatchObject({ code: 'CONFLICT', status: 409 });
  });
});
