import { TEST_SCHEMA, applyTestEnvironment } from '../tests/test-env.js';

applyTestEnvironment();

const connectionSummary = {
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  schema: process.env.PGSCHEMA
};

try {
  const { dropSchema, runMigrations } = await import('../src/shared/db/migrate.js');

  await dropSchema({ schema: TEST_SCHEMA });

  try {
    await runMigrations({ direction: 'up', schema: TEST_SCHEMA });
  } finally {
    await dropSchema({ schema: TEST_SCHEMA });
  }
} catch (error) {
  console.error(
    [
      'Backend DB validation requires a reachable PostgreSQL test database.',
      `Resolved test connection: host=${connectionSummary.host} port=${connectionSummary.port} database=${connectionSummary.database} user=${connectionSummary.user} schema=${connectionSummary.schema}`,
      'Set PGTESTHOST / PGTESTPORT / PGTESTDATABASE / PGTESTUSER / PGTESTPASSWORD / PGTESTSCHEMA if these defaults are not correct.'
    ].join('\n')
  );
  throw error;
}
