import { jest } from '@jest/globals';
import request from 'supertest';

const mockCheckDatabaseHealth = jest.fn();
const mockLoggerError = jest.fn();

jest.unstable_mockModule('../../src/shared/db/health.js', () => ({
  checkDatabaseHealth: mockCheckDatabaseHealth
}));

jest.unstable_mockModule('../../src/shared/utils/logger.js', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: mockLoggerError
  }
}));

const { createApp } = await import('../../src/app.js');

afterEach(() => {
  mockCheckDatabaseHealth.mockReset();
  mockLoggerError.mockReset();
});

describe('health endpoints', () => {
  test('GET /health returns healthy response envelope', async () => {
    const app = createApp();
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: { status: 'ok' } });
  });

  test('GET /health/db returns healthy response when db probe succeeds', async () => {
    const app = createApp();
    mockCheckDatabaseHealth.mockResolvedValue({ status: 'ok' });

    const res = await request(app).get('/health/db');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: { status: 'ok' } });
  });

  test('GET /health/db returns failure envelope when db probe fails', async () => {
    const app = createApp();
    mockCheckDatabaseHealth.mockRejectedValue(new Error('connect failed'));

    const res = await request(app).get('/health/db');

    expect(res.status).toBe(503);
    expect(res.body).toEqual({
      success: false,
      message: 'Database unavailable',
      code: 'DB_UNAVAILABLE'
    });
    expect(mockLoggerError).toHaveBeenCalledWith('Database health check failed', expect.objectContaining({
      code: 'DB_HEALTHCHECK_FAILED',
      message: 'connect failed'
    }));
  });
});
