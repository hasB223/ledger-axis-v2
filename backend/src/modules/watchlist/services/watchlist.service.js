<<<<<<< ours
import { watchlistRepository } from '../repositories/watchlist.repository.js';

export const watchlistService = {
  health: async () => {
    // TODO: replace with real business logic and service orchestration.
    return watchlistRepository.health();
=======
import { AppError } from '../../../shared/errors/app-error.js';
import { watchlistRepository } from '../repositories/watchlist.repository.js';
import { companiesRepository } from '../../companies/repositories/companies.repository.js';

export const watchlistService = {
  list: ({ tenantId, userId }) => watchlistRepository.list({ tenantId, userId }),
  async create({ tenantId, userId, payload }) {
    const company = await companiesRepository.findById({ tenantId, id: payload.companyId });
    if (!company) throw new AppError('Company not found', 'NOT_FOUND', 404);
    const existing = await watchlistRepository.findExisting({ tenantId, userId, companyId: payload.companyId });
    if (existing) throw new AppError('Watchlist entry already exists', 'CONFLICT', 409);
    return watchlistRepository.create({ tenantId, userId, companyId: payload.companyId, note: payload.note });
  },
  async remove({ tenantId, userId, id }) {
    const removed = await watchlistRepository.remove({ tenantId, userId, id });
    if (!removed) throw new AppError('Watchlist entry not found', 'NOT_FOUND', 404);
    return { id };
>>>>>>> theirs
  }
};
