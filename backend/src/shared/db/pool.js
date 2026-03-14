<<<<<<< ours
import { Pool } from 'pg';

// TODO: add pg Pool config validation/tuning for PostgreSQL 17 workloads.
export const pgPool = new Pool();
=======
import pg from 'pg';
import { env } from '../config/env.js';

const { Pool } = pg;
export const pool = new Pool(env.pg);

export const query = (text, params = []) => pool.query(text, params);
>>>>>>> theirs
