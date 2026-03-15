afterAll(async () => {
  const { pool } = await import('../../src/shared/db/pool.js');
  await pool.end();
});
