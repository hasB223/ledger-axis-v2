import fs from 'node:fs';

const file = fs.readFileSync(new URL('../../src/modules/companies/repositories/companies.repository.js', import.meta.url), 'utf8');

describe('tenant repository signatures', () => {
  test('repository APIs accept request context while retaining explicit tenant scoping', () => {
    expect(file).toContain('findById(ctx, { id })');
    expect(file).toContain('list(ctx, { q, page, limit, industry, source, sortBy, sortOrder })');
    expect(file).toContain('ctx.tenantId');
    expect(file).not.toContain('findById(id)');
  });
});
