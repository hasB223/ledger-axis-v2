import { Router } from 'express';
import { companiesController } from '../controllers/companies.controller.js';

export const companiesRouter = Router();

// TODO: define companies endpoints and attach validators/auth middleware.
companiesRouter.get('/health', companiesController.health);
