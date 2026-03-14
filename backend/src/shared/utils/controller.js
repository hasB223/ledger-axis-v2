import { buildRequestContext } from '../context/request-context.js';
import { ok } from './response.js';

export const withRequestContext = (handler, status = 200) => async (req, res, next) => {
  try {
    const result = await handler(buildRequestContext(req), req);
    return ok(res, result, status);
  } catch (error) {
    return next(error);
  }
};
