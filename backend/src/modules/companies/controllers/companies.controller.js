import { companiesService } from '../services/companies.service.js';
import { withRequestContext } from '../../../shared/utils/controller.js';

export const companiesController = {
  list: withRequestContext((ctx, req) => companiesService.list(ctx, req.query)),
  getById: withRequestContext((ctx, req) => companiesService.getById(ctx, { id: req.params.id })),
  create: withRequestContext((ctx, req) => companiesService.create(ctx, { payload: req.body }), 201),
  update: withRequestContext((ctx, req) => companiesService.update(ctx, { id: req.params.id, payload: req.body })),
  remove: withRequestContext((ctx, req) => companiesService.remove(ctx, { id: req.params.id })),
  companyDirectors: withRequestContext((ctx, req) => companiesService.getDirectorsByCompany(ctx, { companyId: req.params.id }))
};
