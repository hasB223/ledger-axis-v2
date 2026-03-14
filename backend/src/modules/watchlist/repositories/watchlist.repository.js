import { query } from '../../../shared/db/pool.js';

export const watchlistRepository = {
  list: async (ctx) => (await query(
    `SELECT w.id, w.company_id, c.name AS company_name, w.note, w.created_at
     FROM watchlist_entries w JOIN companies c ON c.id=w.company_id
     WHERE w.tenant_id=$1 AND w.user_id=$2 ORDER BY w.created_at DESC`,
    [ctx.tenantId, ctx.userId]
  )).rows,

  findExisting: async (ctx, { companyId }) => (await query(
    'SELECT id FROM watchlist_entries WHERE tenant_id=$1 AND user_id=$2 AND company_id=$3',
    [ctx.tenantId, ctx.userId, companyId]
  )).rows[0] || null,

  create: async (ctx, { companyId, note }) => (await query(
    `INSERT INTO watchlist_entries (tenant_id,user_id,company_id,note,created_at)
     VALUES ($1,$2,$3,$4,NOW()) RETURNING id, company_id, note, created_at`,
    [ctx.tenantId, ctx.userId, companyId, note || null]
  )).rows[0],

  remove: async (ctx, { id }) => (await query(
    'DELETE FROM watchlist_entries WHERE tenant_id=$1 AND user_id=$2 AND id=$3',
    [ctx.tenantId, ctx.userId, id]
  )).rowCount > 0
};
