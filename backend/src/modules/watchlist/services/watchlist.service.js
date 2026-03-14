import { watchlistRepository } from '../repositories/watchlist.repository.js';
import { companiesRepository } from '../../companies/repositories/companies.repository.js';
import { watchlistDomainService } from '../domain/watchlist-domain.service.js';

export const watchlistService = {
  list: ({ tenantId, userId }) => watchlistRepository.list({ tenantId, userId }),
  async create({ tenantId, userId, payload }) {
    const company = await companiesRepository.findById({ tenantId, id: payload.companyId });
    watchlistDomainService.ensureCompanyVisible(company);
    const existing = await watchlistRepository.findExisting({ tenantId, userId, companyId: payload.companyId });
    watchlistDomainService.ensureEntryAbsent(existing);
    return watchlistRepository.create({ tenantId, userId, companyId: payload.companyId, note: payload.note });
  },
  async remove({ tenantId, userId, id }) {
    const removed = await watchlistRepository.remove({ tenantId, userId, id });
    watchlistDomainService.ensureEntryRemoved(removed);
    return { id };
  }
};
