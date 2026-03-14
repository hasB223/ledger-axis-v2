import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { authenticate, authorize } from '../../src/shared/middleware/auth.middleware.js';
import { errorHandler } from '../../src/shared/middleware/error.middleware.js';
import { logger } from '../../src/shared/utils/logger.js';

const runMw = (mw, req = {}, res = {}, next = jest.fn()) => mw(req, res, next);
const loggerOriginal = { ...logger };

afterEach(() => {
  Object.assign(logger, loggerOriginal);
});

describe('auth and error middleware', () => {
  test('auth middleware sets req.user for valid token', () => {
    const token = jwt.sign({ userId: 'u1', tenantId: 't1', role: 'viewer' }, process.env.JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } };
    const next = jest.fn();
    runMw(authenticate, req, {}, next);
    expect(req.user).toEqual({ userId: 'u1', tenantId: 't1', role: 'viewer' });
    expect(next).toHaveBeenCalledWith();
  });

  test('viewer cannot write by role middleware', () => {
    const req = { user: { role: 'viewer' } };
    const next = jest.fn();
    runMw(authorize('editor', 'admin'), req, {}, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ code: 'FORBIDDEN', status: 403 }));
  });

  test('error middleware returns standard envelope', () => {
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    errorHandler({ status: 400, code: 'VALIDATION_ERROR', message: 'bad payload' }, { requestId: 'r-1' }, { status }, jest.fn());
    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ success: false, message: 'bad payload', code: 'VALIDATION_ERROR' });
  });

  test('error middleware logs server errors with request context', () => {
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    logger.error = jest.fn();

    errorHandler(
      { status: 500, code: 'INTERNAL_ERROR', message: 'boom', stack: 'trace' },
      { requestId: 'r-1', user: { userId: 'u1', tenantId: 't1', role: 'admin' } },
      { status },
      jest.fn()
    );

    expect(logger.error).toHaveBeenCalledWith('Unhandled request error', expect.objectContaining({
      requestId: 'r-1',
      userId: 'u1',
      tenantId: 't1',
      role: 'admin',
      code: 'INTERNAL_ERROR'
    }));
  });
});
