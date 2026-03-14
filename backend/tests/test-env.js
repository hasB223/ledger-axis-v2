export const TEST_SCHEMA = 'ledgeraxis_test_suite';

export function applyTestEnvironment() {
  process.env.NODE_ENV = 'test';
  process.env.PORT = '4100';
  process.env.API_PREFIX = '/api';
  process.env.API_DOCS_ENABLED = 'false';
  process.env.CORS_ORIGIN = '*';
  process.env.JWT_SECRET = 'test-secret-key-123456';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.BCRYPT_SALT_ROUNDS = '10';
  process.env.RATE_LIMIT_WINDOW_MS = '60000';
  process.env.RATE_LIMIT_MAX = '50';
  process.env.PGHOST = process.env.PGHOST || 'localhost';
  process.env.PGPORT = process.env.PGPORT || '5432';
  process.env.PGDATABASE = process.env.PGDATABASE || 'ledgeraxis_test';
  process.env.PGUSER = process.env.PGUSER || 'ledgeraxis';
  process.env.PGPASSWORD = process.env.PGPASSWORD || 'ledgeraxis';
  process.env.PGSSLMODE = process.env.PGSSLMODE || 'disable';
  process.env.PGSCHEMA = process.env.PGSCHEMA || TEST_SCHEMA;
  process.env.INGESTION_CRON = '*/30 * * * *';
  process.env.INGESTION_SOURCE_URL = 'https://example.com/source';
}
