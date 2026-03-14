import { watchlistRepository } from '../repositories/watchlist.repository.js';
import { companiesRepository } from '../../companies/repositories/companies.repository.js';
import { watchlistDomainService } from '../domain/watchlist-domain.service.js';

export const watchlistService = {
  list: (ctx) => watchlistRepository.list(ctx),
  async create(ctx, { payload }) {
    const company = await companiesRepository.findById(ctx, { id: payload.companyId });
    watchlistDomainService.ensureCompanyVisible(company);
    const existing = await watchlistRepository.findExisting(ctx, { companyId: payload.companyId });
    watchlistDomainService.ensureEntryAbsent(existing);
    return watchlistRepository.create(ctx, { companyId: payload.companyId, note: payload.note });
  },
  async remove(ctx, { id }) {
    const removed = await watchlistRepository.remove(ctx, { id });
    watchlistDomainService.ensureEntryRemoved(removed);
    return { id };
  }
};
