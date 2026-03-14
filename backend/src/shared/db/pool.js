import pg from 'pg';
import { env } from '../config/env.js';

const { Pool } = pg;
export const pool = new Pool(env.pg);

export const query = (text, params = []) => pool.query(text, params);
