import { AppError } from '../../../shared/errors/app-error.js';
import { directorsRepository } from '../repositories/directors.repository.js';

export const directorsService = {
  async getById({ tenantId, id }) {
    const director = await directorsRepository.findByIdVisibleToTenant({ tenantId, directorId: id });
    if (!director) throw new AppError('Director not found', 'NOT_FOUND', 404);
    return director;
  }
};
