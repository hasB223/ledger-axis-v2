// TODO: replace with structured logger (pino/winston) and request correlation IDs.
export const logger = {
  info: (message, meta = {}) => console.log(message, meta),
  warn: (message, meta = {}) => console.warn(message, meta),
  error: (message, meta = {}) => console.error(message, meta)
};
