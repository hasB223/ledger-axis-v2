import request from 'supertest';
import { createApp } from '../../src/app.js';

describe('health endpoint', () => {
  test('returns healthy response envelope', async () => {
    const app = createApp();
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: { status: 'ok' } });
  });
});
