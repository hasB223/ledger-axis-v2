// TODO: replace with structured logger (pino/winston) and request correlation IDs.
export const logger = {
  info: (...args) => console.log(...args),
  warn: (...args) => console.warn(...args),
  error: (...args) => console.error(...args)
};
