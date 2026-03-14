import { buildRequestContext, createSystemContext } from '../../src/shared/context/request-context.js';

describe('request context helpers', () => {
  test('builds request context from express request data', () => {
    expect(
      buildRequestContext({
        requestId: 'req-1',
        user: { userId: 'u1', tenantId: 't1', role: 'admin' }
      })
    ).toEqual({
      requestId: 'req-1',
      userId: 'u1',
      tenantId: 't1',
      role: 'admin'
    });
  });

  test('creates explicit system context for non-request flows', () => {
    expect(createSystemContext({ requestId: 'sys-1' })).toEqual({
      requestId: 'sys-1',
      userId: null,
      tenantId: null,
      role: 'system'
    });
  });
});
