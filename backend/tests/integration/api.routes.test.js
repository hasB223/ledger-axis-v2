import { jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../src/app.js';
import { authService } from '../../src/modules/auth/services/auth.service.js';
import { analyticsService } from '../../src/modules/analytics/services/analytics.service.js';
import { companiesService } from '../../src/modules/companies/services/companies.service.js';
import { ingestionService } from '../../src/modules/ingestion/services/ingestion.service.js';
import { directorsService } from '../../src/modules/directors/services/directors.service.js';
import { AppError } from '../../src/shared/errors/app-error.js';

const token = (role = 'viewer', tenantId = 't1', userId = 'u1') => jwt.sign({ role, tenantId, userId }, process.env.JWT_SECRET);

describe('selected API routes', () => {
  let app;

  beforeEach(() => {
    app = createApp();
    authService.login = jest.fn().mockResolvedValue({ token: 'jwt', user: { id: 'u1' } });
    analyticsService.industrySummary = jest.fn().mockResolvedValue([{ industry: 'Technology', count: 3 }]);
    companiesService.list = jest.fn().mockResolvedValue([{ id: 'c1' }]);
    companiesService.create = jest.fn().mockResolvedValue({ id: 'c2' });
    companiesService.update = jest.fn().mockResolvedValue({ id: 'c2' });
    companiesService.remove = jest.fn().mockResolvedValue({ id: 'c2' });
    companiesService.getById = jest.fn().mockResolvedValue({ id: 'c1' });
    ingestionService.trigger = jest.fn().mockResolvedValue({ processed: 1, changed: 1 });
    directorsService.getById = jest.fn().mockResolvedValue({ id: 'd1' });
  });

  test('login success', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'a@b.com', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: { token: 'jwt', user: { id: 'u1' } } });
  });

  test('login accepts local development email domains', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin.alpha@ledgeraxis.local', password: 'password123' });

    expect(res.status).toBe(200);
    expect(authService.login).toHaveBeenCalledWith({
      email: 'admin.alpha@ledgeraxis.local',
      password: 'password123'
    });
  });

  test('invalid credentials rejected safely', async () => {
    authService.login = jest.fn().mockRejectedValue(new AppError('Invalid credentials', 'UNAUTHORIZED', 401));
    const res = await request(app).post('/api/auth/login').send({ email: 'a@b.com', password: 'bad' });
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ success: false, message: 'Invalid credentials', code: 'UNAUTHORIZED' });
  });

  test('viewer cannot write', async () => {
    const res = await request(app)
      .post('/api/companies')
      .set('Authorization', `Bearer ${token('viewer')}`)
      .send({ registrationNo: 'R1', name: 'Acme', source: 'registry' });
    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({ success: false, code: 'FORBIDDEN' });
  });

  test('editor can create/update but cannot delete', async () => {
    const editorToken = token('editor');
    const c = await request(app)
      .post('/api/companies')
      .set('Authorization', `Bearer ${editorToken}`)
      .send({ registrationNo: 'R1', name: 'Acme', source: 'registry' });
    expect(c.status).toBe(201);

    const u = await request(app)
      .put('/api/companies/c2')
      .set('Authorization', `Bearer ${editorToken}`)
      .send({ name: 'Acme 2' });
    expect(u.status).toBe(200);

    const d = await request(app)
      .delete('/api/companies/c2')
      .set('Authorization', `Bearer ${editorToken}`);
    expect(d.status).toBe(403);
    expect(d.body.code).toBe('FORBIDDEN');
  });

  test('admin can trigger ingestion', async () => {
    const res = await request(app).post('/api/ingestion/trigger').set('Authorization', `Bearer ${token('admin')}`).send({ dryRun: false });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('validation failures return VALIDATION_ERROR envelope', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'bad-email' });
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ success: false, code: 'VALIDATION_ERROR' });
  });

  test('forbidden and not-found flows return proper envelopes', async () => {
    const forbidden = await request(app).delete('/api/companies/c1').set('Authorization', `Bearer ${token('viewer')}`);
    expect(forbidden.status).toBe(403);
    expect(forbidden.body).toMatchObject({ success: false, code: 'FORBIDDEN' });

    companiesService.getById = jest.fn().mockRejectedValue(new AppError('Company not found', 'NOT_FOUND', 404));
    const notFound = await request(app).get('/api/companies/404').set('Authorization', `Bearer ${token('viewer')}`);
    expect(notFound.status).toBe(404);
    expect(notFound.body).toMatchObject({ success: false, code: 'NOT_FOUND' });
  });

  test('company list filtering, pagination and search use GET /api/companies query params', async () => {
    const res = await request(app)
      .get('/api/companies')
      .query({ q: 'acme', page: 2, limit: 10, industry: 'Tech', source: 'registry', sortBy: 'name', sortOrder: 'asc' })
      .set('Authorization', `Bearer ${token('viewer')}`);

    expect(res.status).toBe(200);
    expect(companiesService.list).toHaveBeenCalledWith({
      requestId: expect.any(String),
      tenantId: 't1',
      userId: 'u1',
      role: 'viewer'
    }, {
      q: 'acme',
      page: 2,
      limit: 10,
      industry: 'Tech',
      source: 'registry',
      sortBy: 'name',
      sortOrder: 'asc'
    });
  });

  test('analytics endpoints delegate tenant-scoped context', async () => {
    const res = await request(app)
      .get('/api/analytics/industry-summary')
      .set('Authorization', `Bearer ${token('viewer')}`);

    expect(res.status).toBe(200);
    expect(analyticsService.industrySummary).toHaveBeenCalledWith({
      requestId: expect.any(String),
      tenantId: 't1',
      userId: 'u1',
      role: 'viewer'
    });
  });

  test('director profile blocked if inaccessible through tenant-visible companies', async () => {
    directorsService.getById = jest.fn().mockRejectedValue(new AppError('Director not found', 'NOT_FOUND', 404));
    const res = await request(app).get('/api/directors/d-1').set('Authorization', `Bearer ${token('viewer')}`);
    expect(res.status).toBe(404);
    expect(res.body.code).toBe('NOT_FOUND');
  });
});
