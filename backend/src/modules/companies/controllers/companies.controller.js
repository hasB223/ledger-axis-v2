import { companiesService } from '../services/companies.service.js';
import { ok } from '../../../shared/utils/response.js';

export const companiesController = {
  list: async (req, res, next) => { try { return ok(res, await companiesService.list({ tenantId: req.user.tenantId, query: req.query })); } catch (e) { return next(e); } },
  getById: async (req, res, next) => { try { return ok(res, await companiesService.getById({ tenantId: req.user.tenantId, id: req.params.id })); } catch (e) { return next(e); } },
  create: async (req, res, next) => { try { return ok(res, await companiesService.create({ tenantId: req.user.tenantId, userId: req.user.userId, payload: req.body }), 201); } catch (e) { return next(e); } },
  update: async (req, res, next) => { try { return ok(res, await companiesService.update({ tenantId: req.user.tenantId, id: req.params.id, payload: req.body, userId: req.user.userId })); } catch (e) { return next(e); } },
  remove: async (req, res, next) => { try { return ok(res, await companiesService.remove({ tenantId: req.user.tenantId, id: req.params.id, userId: req.user.userId })); } catch (e) { return next(e); } },
  companyDirectors: async (req, res, next) => { try { return ok(res, await companiesService.getDirectorsByCompany({ tenantId: req.user.tenantId, companyId: req.params.id })); } catch (e) { return next(e); } }
};
