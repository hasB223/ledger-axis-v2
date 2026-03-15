import pg from 'pg';
import { dbEnv } from '../config/db-env.js';

const { Pool } = pg;
export const pool = new Pool(dbEnv.pg);

export const query = (text, params = []) => pool.query(text, params);
