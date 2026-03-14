import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(72).required(),
  fullName: Joi.string().min(2).max(120).required(),
  tenantName: Joi.string().min(2).max(120).required(),
  role: Joi.string().valid('viewer', 'editor', 'admin').default('admin')
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});
