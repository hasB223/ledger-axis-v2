// TODO: implement tenant header/token extraction for request context only.
// NOTE: Repository layer must still explicitly accept tenantId for isolation guarantees.
export const tenantContextMiddleware = (req, _res, next) => next();
