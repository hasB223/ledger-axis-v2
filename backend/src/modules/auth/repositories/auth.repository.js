export const authRepository = {
  health: async () => ({ module: 'auth', status: 'ok' }),

  // TODO: enforce strict tenant isolation in all data access methods.
  // Example signature pattern (required):
  // findById: async ({ tenantId, id }) => {}
  // Avoid ambiguous signatures like findById(id).
};
