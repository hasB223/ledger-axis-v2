import { query } from './pool.js';

export async function checkDatabaseHealth() {
  await query('SELECT 1');
  return { status: 'ok' };
}
