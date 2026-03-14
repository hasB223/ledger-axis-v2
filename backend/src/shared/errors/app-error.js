export class AppError extends Error {
<<<<<<< ours
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
=======
  constructor(message, code = 'INTERNAL_ERROR', status = 500, details) {
    super(message);
    this.code = code;
    this.status = status;
>>>>>>> theirs
    this.details = details;
  }
}
