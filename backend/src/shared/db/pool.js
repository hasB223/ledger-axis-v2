import { Pool } from 'pg';

// TODO: add pg Pool config validation/tuning for PostgreSQL 17 workloads.
export const pgPool = new Pool();
