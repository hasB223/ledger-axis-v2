import { AppError } from '../errors/app-error.js';

export const validate = (schema, source = 'body') => (req, _res, next) => {
  const { value, error } = schema.validate(req[source], { abortEarly: false, stripUnknown: true });
  if (error) return next(new AppError(error.message, 'VALIDATION_ERROR', 400));
  req[source] = value;
  return next();
};
