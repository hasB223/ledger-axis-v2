import { query } from '../../../shared/db/pool.js';

export const watchlistRepository = {
  list: async ({ tenantId, userId }) => (await query(
    `SELECT w.id, w.company_id, c.name AS company_name, w.note, w.created_at
     FROM watchlist_entries w JOIN companies c ON c.id=w.company_id
     WHERE w.tenant_id=$1 AND w.user_id=$2 ORDER BY w.created_at DESC`,
    [tenantId, userId]
  )).rows,

  findExisting: async ({ tenantId, userId, companyId }) => (await query(
    'SELECT id FROM watchlist_entries WHERE tenant_id=$1 AND user_id=$2 AND company_id=$3',
    [tenantId, userId, companyId]
  )).rows[0] || null,

  create: async ({ tenantId, userId, companyId, note }) => (await query(
    `INSERT INTO watchlist_entries (tenant_id,user_id,company_id,note,created_at)
     VALUES ($1,$2,$3,$4,NOW()) RETURNING id, company_id, note, created_at`,
    [tenantId, userId, companyId, note || null]
  )).rows[0],

  remove: async ({ tenantId, userId, id }) => (await query(
    'DELETE FROM watchlist_entries WHERE tenant_id=$1 AND user_id=$2 AND id=$3',
    [tenantId, userId, id]
  )).rowCount > 0
};
