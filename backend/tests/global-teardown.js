import { applyTestEnvironment, TEST_SCHEMA } from './test-env.js';

export default async function globalTeardown() {
  applyTestEnvironment();
  const { dropSchema } = await import('../src/shared/db/migrate.js');
  await dropSchema({ schema: TEST_SCHEMA });
}
