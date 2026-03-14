import { Router } from 'express';
import { companiesController } from '../controllers/companies.controller.js';
import { authenticate, authorize } from '../../../shared/middleware/auth.middleware.js';
import { validate } from '../../../shared/middleware/validate.middleware.js';
import { companyCreateSchema, companyQuerySchema, companyUpdateSchema } from '../validators/companies.validator.js';

export const companiesRouter = Router();

companiesRouter.use(authenticate);
/** @swagger
 * /companies:
 *   get:
 *     tags: [Companies]
 *     summary: List tenant-visible companies
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
 *       - in: query
 *         name: industry
 *         schema: { type: string }
 *       - in: query
 *         name: source
 *         schema: { type: string }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [name, created_at, updated_at] }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc] }
 *     responses:
 *       200:
 *         description: Company list.
 *   post:
 *     tags: [Companies]
 *     summary: Create a company
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CompanyPayload'
 *     responses:
 *       201:
 *         description: Company created.
 *       403:
 *         description: Viewer role cannot create companies.
 */
/** @swagger
 * /companies/{id}:
 *   get:
 *     tags: [Companies]
 *     summary: Get a tenant-visible company by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Company details.
 *       404:
 *         description: Company not found for tenant.
 *   put:
 *     tags: [Companies]
 *     summary: Update a company
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CompanyPayload'
 *     responses:
 *       200:
 *         description: Company updated.
 *       403:
 *         description: Viewer role cannot update companies.
 *   delete:
 *     tags: [Companies]
 *     summary: Delete a company
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Company deleted.
 *       403:
 *         description: Only admins can delete companies.
 */
/** @swagger
 * /companies/{id}/directors:
 *   get:
 *     tags: [Companies]
 *     summary: Get directors linked to a tenant-visible company
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Directors for the requested company.
 */
companiesRouter.get('/', authorize('viewer', 'editor', 'admin'), validate(companyQuerySchema, 'query'), companiesController.list);
companiesRouter.get('/:id', authorize('viewer', 'editor', 'admin'), companiesController.getById);
companiesRouter.post('/', authorize('editor', 'admin'), validate(companyCreateSchema), companiesController.create);
companiesRouter.put('/:id', authorize('editor', 'admin'), validate(companyUpdateSchema), companiesController.update);
companiesRouter.delete('/:id', authorize('admin'), companiesController.remove);
companiesRouter.get('/:id/directors', authorize('viewer', 'editor', 'admin'), companiesController.companyDirectors);
