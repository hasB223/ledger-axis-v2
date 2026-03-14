export const errorHandler = (err, req, res, _next) => {
  const status = err.status || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'Internal server error';
  if (status >= 500) {
    console.error({ requestId: req.requestId, code, message, stack: err.stack });
  }
  res.status(status).json({ success: false, message, code });
};
