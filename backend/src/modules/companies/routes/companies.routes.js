import { Router } from 'express';
import { companiesController } from '../controllers/companies.controller.js';
import { authenticate, authorize } from '../../../shared/middleware/auth.middleware.js';
import { validate } from '../../../shared/middleware/validate.middleware.js';
import { companyCreateSchema, companyQuerySchema, companyUpdateSchema } from '../validators/companies.validator.js';

export const companiesRouter = Router();

companiesRouter.use(authenticate);
companiesRouter.get('/', authorize('viewer', 'editor', 'admin'), validate(companyQuerySchema, 'query'), companiesController.list);
companiesRouter.get('/:id', authorize('viewer', 'editor', 'admin'), companiesController.getById);
companiesRouter.post('/', authorize('editor', 'admin'), validate(companyCreateSchema), companiesController.create);
companiesRouter.put('/:id', authorize('editor', 'admin'), validate(companyUpdateSchema), companiesController.update);
companiesRouter.delete('/:id', authorize('admin'), companiesController.remove);
companiesRouter.get('/:id/directors', authorize('viewer', 'editor', 'admin'), companiesController.companyDirectors);
