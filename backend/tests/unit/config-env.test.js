import { loadAppEnv } from '../../src/shared/config/app-env.js';
import { loadDbEnv } from '../../src/shared/config/db-env.js';

const dbOnlyVars = {
  PGHOST: 'localhost',
  PGPORT: '5432',
  PGDATABASE: 'ledgeraxis',
  PGUSER: 'ledgeraxis',
  PGPASSWORD: 'secret',
  PGSCHEMA: 'public'
};

describe('config env loaders', () => {
  test('db env loads with PostgreSQL settings only', () => {
    const env = loadDbEnv(dbOnlyVars);

    expect(env.pg).toMatchObject({
      host: 'localhost',
      port: 5432,
      database: 'ledgeraxis',
      user: 'ledgeraxis',
      password: 'secret',
      schema: 'public'
    });
    expect(env.bcryptSaltRounds).toBe(12);
  });

  test('app env still requires JWT and ingestion settings', () => {
    expect(() => loadAppEnv(dbOnlyVars)).toThrow(/JWT_SECRET/);
    expect(() => loadAppEnv(dbOnlyVars)).toThrow(/INGESTION_SOURCE_URL/);
  });

  test('app env loads when runtime-only settings are present', () => {
    const env = loadAppEnv({
      ...dbOnlyVars,
      JWT_SECRET: 'super-secret-key-123',
      INGESTION_SOURCE_URL: 'https://example.gov/companies'
    });

    expect(env.jwtSecret).toBe('super-secret-key-123');
    expect(env.ingestionSourceUrl).toBe('https://example.gov/companies');
    expect(env.pg.database).toBe('ledgeraxis');
  });
});
