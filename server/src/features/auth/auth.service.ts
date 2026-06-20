import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { AuthRepository } from './auth.repository';
import { AuthResponse, AuthTokens, User } from './auth.types';
import { ConflictError, UnauthorizedError } from '../../shared/errors';

const SALT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export class AuthService {
  private repository: AuthRepository;

  constructor() {
    this.repository = new AuthRepository();
  }

  private generateTokens(userId: string): AuthTokens {
    const accessToken = jwt.sign({ userId }, env.JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });

    const refreshToken = jwt.sign({ userId }, env.JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
    });

    return { accessToken, refreshToken };
  }

  async signup(email: string, password: string, name: string): Promise<AuthResponse> {
    const existing = await this.repository.findByEmail(email);
    if (existing) {
      throw new ConflictError('Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await this.repository.create(email, passwordHash, name);
    const tokens = this.generateTokens(user.id);

    await this.repository.updateRefreshToken(user.id, tokens.refreshToken);

    // Create default profiles for new user
    await this.repository.createGamificationProfile(user.id);
    await this.repository.createLifestyleProfile(user.id);

    return { user, ...tokens };
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const user = await this.repository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const tokens = this.generateTokens(user.id);
    await this.repository.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
      ...tokens,
    };
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { userId: string };
      const storedToken = await this.repository.getRefreshToken(decoded.userId);

      if (storedToken !== refreshToken) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      const tokens = this.generateTokens(decoded.userId);
      await this.repository.updateRefreshToken(decoded.userId, tokens.refreshToken);

      return tokens;
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    await this.repository.updateRefreshToken(userId, null);
  }

  async getProfile(userId: string): Promise<User> {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }
    return user;
  }
}
