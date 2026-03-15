import { applyTestEnvironment, TEST_SCHEMA } from '../test-env.js';

export default async function globalSetup() {
  applyTestEnvironment();
  const connectionSummary = {
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    schema: process.env.PGSCHEMA
  };

  try {
    const { runMigrations, dropSchema } = await import('../../src/shared/db/migrate.js');
    await dropSchema({ schema: TEST_SCHEMA });
    await runMigrations({ direction: 'up', schema: TEST_SCHEMA });
  } catch (error) {
    console.error(
      [
        'Backend DB-backed tests require a reachable PostgreSQL database.',
        `Resolved test connection: host=${connectionSummary.host} port=${connectionSummary.port} database=${connectionSummary.database} user=${connectionSummary.user} schema=${connectionSummary.schema}`,
        'Set PGTESTHOST / PGTESTPORT / PGTESTDATABASE / PGTESTUSER / PGTESTPASSWORD / PGTESTSCHEMA if these defaults are not correct.'
      ].join('\n')
    );
    throw error;
  }
}
