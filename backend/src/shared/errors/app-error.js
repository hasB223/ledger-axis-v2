export class AppError extends Error {
  constructor(message, code = 'INTERNAL_ERROR', status = 500, details) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}
