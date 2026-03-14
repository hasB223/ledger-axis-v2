import fs from 'node:fs';

const file = fs.readFileSync(new URL('../../src/modules/companies/repositories/companies.repository.js', import.meta.url), 'utf8');

describe('tenant repository signatures', () => {
  test('repository APIs explicitly include tenantId in method signatures', () => {
    expect(file).toContain('findById({ tenantId, id })');
    expect(file).toContain('list({ tenantId, q, page, limit, industry, source, sortBy, sortOrder })');
    expect(file).not.toContain('findById(id)');
  });
});
