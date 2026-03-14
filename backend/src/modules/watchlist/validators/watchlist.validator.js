import Joi from 'joi';

export const watchlistCreateSchema = Joi.object({
  companyId: Joi.number().integer().required(),
  note: Joi.string().max(500).allow('', null)
});
