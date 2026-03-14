<<<<<<< ours
export const authRepository = {
  health: async () => ({ module: 'auth', status: 'ok' }),

  // TODO: enforce strict tenant isolation in all data access methods.
  // Example signature pattern (required):
  // findById: async ({ tenantId, id }) => {}
  // Avoid ambiguous signatures like findById(id).
=======
import { query } from '../../../shared/db/pool.js';

export const authRepository = {
  async createTenant({ tenantName }) {
    const sql = `INSERT INTO tenants (name, created_at, updated_at)
      VALUES ($1, NOW(), NOW())
      RETURNING id, name`;
    const { rows } = await query(sql, [tenantName]);
    return rows[0];
  },

  async findUserByEmail({ email }) {
    const { rows } = await query(
      'SELECT id, tenant_id, email, full_name, role, password_hash FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    return rows[0] || null;
  },

  async createUser({ tenantId, email, fullName, role, passwordHash }) {
    const sql = `INSERT INTO users (tenant_id, email, full_name, role, password_hash, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING id, tenant_id, email, full_name, role`;
    const { rows } = await query(sql, [tenantId, email.toLowerCase(), fullName, role, passwordHash]);
    return rows[0];
  },

  async findUserById({ tenantId, userId }) {
    const { rows } = await query(
      'SELECT id, tenant_id, email, full_name, role FROM users WHERE id = $1 AND tenant_id = $2',
      [userId, tenantId]
    );
    return rows[0] || null;
  }
>>>>>>> theirs
};
