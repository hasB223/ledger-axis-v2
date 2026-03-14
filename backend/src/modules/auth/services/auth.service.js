import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../../../shared/config/env.js';
import { AppError } from '../../../shared/errors/app-error.js';
import { authRepository } from '../repositories/auth.repository.js';

const signToken = (user) => jwt.sign({ userId: user.id, tenantId: user.tenant_id, role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

export const authService = {
  async register(payload) {
    const existing = await authRepository.findUserByEmail({ email: payload.email });
    if (existing) throw new AppError('Email already registered', 'CONFLICT', 409);

    const tenant = await authRepository.createTenant({ tenantName: payload.tenantName });
    const passwordHash = await bcrypt.hash(payload.password, env.bcryptSaltRounds);
    const user = await authRepository.createUser({
      tenantId: tenant.id,
      email: payload.email,
      fullName: payload.fullName,
      role: payload.role,
      passwordHash
    });
    return { token: signToken(user), user: { ...user, tenant: tenant } };
  },

  async login({ email, password }) {
    const user = await authRepository.findUserByEmail({ email });
    if (!user) throw new AppError('Invalid credentials', 'UNAUTHORIZED', 401);
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) throw new AppError('Invalid credentials', 'UNAUTHORIZED', 401);
    return {
      token: signToken(user),
      user: { id: user.id, tenantId: user.tenant_id, email: user.email, fullName: user.full_name, role: user.role }
    };
  },

  async me({ tenantId, userId }) {
    const user = await authRepository.findUserById({ tenantId, userId });
    if (!user) throw new AppError('User not found', 'NOT_FOUND', 404);
    return { id: user.id, tenantId: user.tenant_id, email: user.email, fullName: user.full_name, role: user.role };
  }
};
