import { randomUUID } from 'node:crypto';

export const buildRequestContext = (req) => ({
  requestId: req.requestId || randomUUID(),
  userId: req.user?.userId ?? null,
  tenantId: req.user?.tenantId ?? null,
  role: req.user?.role ?? null
});

export const createSystemContext = ({ requestId = randomUUID(), tenantId = null } = {}) => ({
  requestId,
  userId: null,
  tenantId,
  role: 'system'
});
