import Joi from 'joi';

<<<<<<< ours
// TODO: define Joi schemas for watchlist module requests.
export const watchlistValidator = {
  placeholder: Joi.object({})
};
=======
export const watchlistCreateSchema = Joi.object({
  companyId: Joi.number().integer().required(),
  note: Joi.string().max(500).allow('', null)
});
>>>>>>> theirs
