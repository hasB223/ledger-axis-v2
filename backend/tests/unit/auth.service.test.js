import { jest } from '@jest/globals';
import { authService } from '../../src/modules/auth/services/auth.service.js';
import { authRepository } from '../../src/modules/auth/repositories/auth.repository.js';

const original = { ...authRepository };

afterEach(() => {
  Object.assign(authRepository, original);
});

describe('authService', () => {
  test('login success', async () => {
    authRepository.findUserByEmail = jest.fn().mockResolvedValue({
      id: 10,
      tenant_id: 2,
      email: 'user@example.com',
      full_name: 'User A',
      role: 'editor',
      password_hash: await (await import('bcrypt')).default.hash('strongPass1', 10)
    });

    const result = await authService.login({ email: 'user@example.com', password: 'strongPass1' });
    expect(result.token).toEqual(expect.any(String));
    expect(result.user.role).toBe('editor');
  });

  test('invalid credentials are rejected safely', async () => {
    authRepository.findUserByEmail = jest.fn().mockResolvedValue(null);
    await expect(authService.login({ email: 'none@example.com', password: 'x' })).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
      status: 401,
      message: 'Invalid credentials'
    });
  });
});
