import { AppError } from '../../../shared/errors/app-error.js';

export const watchlistDomainService = {
  ensureCompanyVisible(company) {
    if (!company) {
      throw new AppError('Company not found', 'NOT_FOUND', 404);
    }
  },

  ensureEntryAbsent(existingEntry) {
    if (existingEntry) {
      throw new AppError('Watchlist entry already exists', 'CONFLICT', 409);
    }
  },

  ensureEntryRemoved(removed) {
    if (!removed) {
      throw new AppError('Watchlist entry not found', 'NOT_FOUND', 404);
    }
  }
};
