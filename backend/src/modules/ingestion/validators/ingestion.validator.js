import Joi from 'joi';

export const ingestionTriggerSchema = Joi.object({
  dryRun: Joi.boolean().default(false)
});
