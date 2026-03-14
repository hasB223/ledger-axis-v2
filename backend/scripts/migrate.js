import { env } from '../src/shared/config/env.js';
import { runMigrations } from '../src/shared/db/migrate.js';

const args = process.argv.slice(2);
const direction = args[0] === 'down' ? 'down' : 'up';
const countArg = args.find((arg) => arg.startsWith('--count='));
const count = countArg ? Number(countArg.split('=')[1]) : undefined;

await runMigrations({
  direction,
  count,
  schema: env.pg.schema
});
