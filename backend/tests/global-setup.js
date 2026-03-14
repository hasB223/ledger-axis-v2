import { applyTestEnvironment, TEST_SCHEMA } from './test-env.js';

export default async function globalSetup() {
  applyTestEnvironment();
  const { runMigrations, dropSchema } = await import('../src/shared/db/migrate.js');
  await dropSchema({ schema: TEST_SCHEMA });
  await runMigrations({ direction: 'up', schema: TEST_SCHEMA });
}
