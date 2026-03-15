import jwt from 'jsonwebtoken';
import { appEnv } from '../config/app-env.js';
import { AppError } from '../errors/app-error.js';

export const authenticate = (req, _res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return next(new AppError('Missing bearer token', 'UNAUTHORIZED', 401));
  try {
    const payload = jwt.verify(auth.slice(7), appEnv.jwtSecret);
    req.user = { userId: payload.userId, tenantId: payload.tenantId, role: payload.role };
    return next();
  } catch {
    return next(new AppError('Invalid token', 'UNAUTHORIZED', 401));
  }
};

export const authorize = (...roles) => (req, _res, next) => {
  if (!req.user) return next(new AppError('Not authenticated', 'UNAUTHORIZED', 401));
  if (!roles.includes(req.user.role)) return next(new AppError('Forbidden', 'FORBIDDEN', 403));
  return next();
};
