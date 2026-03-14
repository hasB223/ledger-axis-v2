import Joi from 'joi';

<<<<<<< ours
// TODO: define Joi schemas for companies module requests.
export const companiesValidator = {
  placeholder: Joi.object({})
};
=======
export const companyQuerySchema = Joi.object({
  q: Joi.string().allow(''),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  industry: Joi.string(),
  source: Joi.string(),
  sortBy: Joi.string().valid('name', 'created_at', 'updated_at').default('updated_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

export const companyCreateSchema = Joi.object({
  registrationNo: Joi.string().required(),
  name: Joi.string().required(),
  industry: Joi.string().allow(null, ''),
  source: Joi.string().required(),
  status: Joi.string().default('active')
});

export const companyUpdateSchema = Joi.object({
  name: Joi.string(),
  industry: Joi.string().allow(null, ''),
  source: Joi.string(),
  status: Joi.string()
}).min(1);
>>>>>>> theirs
