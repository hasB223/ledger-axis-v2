<<<<<<< ours
import { directorsRepository } from '../repositories/directors.repository.js';

export const directorsService = {
  health: async () => {
    // TODO: replace with real business logic and service orchestration.
    return directorsRepository.health();
=======
import { AppError } from '../../../shared/errors/app-error.js';
import { directorsRepository } from '../repositories/directors.repository.js';

export const directorsService = {
  async getById({ tenantId, id }) {
    const director = await directorsRepository.findByIdVisibleToTenant({ tenantId, directorId: id });
    if (!director) throw new AppError('Director not found', 'NOT_FOUND', 404);
    return director;
>>>>>>> theirs
  }
};
