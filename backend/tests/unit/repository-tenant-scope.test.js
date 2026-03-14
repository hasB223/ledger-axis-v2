import fs from 'node:fs';
import path from 'node:path';

const read = (p) => fs.readFileSync(path.join(process.cwd(), 'src', ...p.split('/')), 'utf8');

describe('tenant-scoped repository behavior', () => {
  test('companies repository methods are tenant-aware', () => {
    const content = read('modules/companies/repositories/companies.repository.js');
    expect(content).toContain('tenant_id');
    expect(content).toContain('findById(ctx, { id })');
    expect(content).toContain('ctx.tenantId');
  });

  test('directors visibility query is scoped by tenant-visible companies', () => {
    const content = read('modules/directors/repositories/directors.repository.js');
    expect(content).toContain('JOIN companies c');
    expect(content).toContain('c.tenant_id=$2');
  });
});
