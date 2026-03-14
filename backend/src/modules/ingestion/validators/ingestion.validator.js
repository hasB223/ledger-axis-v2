import Joi from 'joi';

<<<<<<< ours
// TODO: define Joi schemas for ingestion module requests.
export const ingestionValidator = {
  placeholder: Joi.object({})
};
=======
export const ingestionTriggerSchema = Joi.object({
  dryRun: Joi.boolean().default(false)
});
>>>>>>> theirs
