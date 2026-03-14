import { buildRequestContext } from '../context/request-context.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, _next) => {
  const status = err.status || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'Internal server error';
  if (status >= 500) {
    logger.error('Unhandled request error', { ...buildRequestContext(req), code, message, stack: err.stack });
  }
  res.status(status).json({ success: false, message, code });
};
