import { TEST_SCHEMA, applyTestEnvironment } from '../tests/test-env.js';

applyTestEnvironment();

const { dropSchema, runMigrations } = await import('../src/shared/db/migrate.js');

await dropSchema({ schema: TEST_SCHEMA });

try {
  await runMigrations({ direction: 'up', schema: TEST_SCHEMA });
} finally {
  await dropSchema({ schema: TEST_SCHEMA });
}
