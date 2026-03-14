import { companiesService } from '../services/companies.service.js';
import { buildRequestContext } from '../../../shared/context/request-context.js';
import { ok } from '../../../shared/utils/response.js';

export const companiesController = {
  list: async (req, res, next) => { try { return ok(res, await companiesService.list(buildRequestContext(req), req.query)); } catch (e) { return next(e); } },
  getById: async (req, res, next) => { try { return ok(res, await companiesService.getById(buildRequestContext(req), { id: req.params.id })); } catch (e) { return next(e); } },
  create: async (req, res, next) => { try { return ok(res, await companiesService.create(buildRequestContext(req), { payload: req.body }), 201); } catch (e) { return next(e); } },
  update: async (req, res, next) => { try { return ok(res, await companiesService.update(buildRequestContext(req), { id: req.params.id, payload: req.body })); } catch (e) { return next(e); } },
  remove: async (req, res, next) => { try { return ok(res, await companiesService.remove(buildRequestContext(req), { id: req.params.id })); } catch (e) { return next(e); } },
  companyDirectors: async (req, res, next) => { try { return ok(res, await companiesService.getDirectorsByCompany(buildRequestContext(req), { companyId: req.params.id })); } catch (e) { return next(e); } }
};
