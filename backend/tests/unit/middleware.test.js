import jwt from 'jsonwebtoken';
import { authenticate, authorize } from '../../src/shared/middleware/auth.middleware.js';
import { errorHandler } from '../../src/shared/middleware/error.middleware.js';

const runMw = (mw, req = {}, res = {}, next = jest.fn()) => mw(req, res, next);

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
});
