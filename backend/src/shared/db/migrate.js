import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { runner as migrationRunner } from 'node-pg-migrate';
import { env } from '../config/env.js';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.resolve(__dirname, '../../../migrations');

function quoteIdentifier(identifier) {
  return `"${identifier.replace(/"/g, '""')}"`;
}

function toSchemaList(value) {
  return Array.isArray(value) ? value : [value];
}

async function ensureSchemasExist({ schema, migrationsSchema, databaseUrl }) {
  const pool = new Pool({ connectionString: databaseUrl });
  const schemaNames = new Set([
    ...toSchemaList(schema).filter(Boolean),
    ...toSchemaList(migrationsSchema).filter(Boolean)
  ]);

  try {
    for (const schemaName of schemaNames) {
      await pool.query(`CREATE SCHEMA IF NOT EXISTS ${quoteIdentifier(schemaName)}`);
    }
  } finally {
    await pool.end();
  }
}

export function buildDatabaseUrl(pgConfig = env.pg) {
  const databaseUrl = new URL('postgresql://localhost');
  databaseUrl.username = pgConfig.user;
  databaseUrl.password = pgConfig.password;
  databaseUrl.hostname = pgConfig.host;
  databaseUrl.port = String(pgConfig.port);
  databaseUrl.pathname = `/${pgConfig.database}`;

  if (pgConfig.ssl) {
    databaseUrl.searchParams.set('sslmode', 'require');
  }

  return databaseUrl.toString();
}

export async function runMigrations({
  direction = 'up',
  count,
  schema = env.pg.schema,
  databaseUrl = buildDatabaseUrl(env.pg)
} = {}) {
  const migrationsSchema = Array.isArray(schema) ? schema[0] : schema;

  await ensureSchemasExist({
    schema,
    migrationsSchema,
    databaseUrl
  });

  return migrationRunner({
    databaseUrl,
    dir: migrationsDir,
    direction,
    count,
    schema,
    migrationsSchema,
    migrationsTable: 'pgmigrations',
    createSchema: true,
    noLock: true,
    singleTransaction: true
  });
}

export async function dropSchema({ schema = env.pg.schema, databaseUrl = buildDatabaseUrl(env.pg) } = {}) {
  const pool = new Pool({ connectionString: databaseUrl });

  try {
    await pool.query(`DROP SCHEMA IF EXISTS ${quoteIdentifier(schema)} CASCADE`);
  } finally {
    await pool.end();
  }
}
