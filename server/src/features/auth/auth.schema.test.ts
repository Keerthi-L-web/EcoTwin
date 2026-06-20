import { describe, it, expect } from 'vitest';
import { signupSchema, loginSchema, refreshSchema } from '../features/auth/auth.schema';

describe('Auth Validation Schemas', () => {
  describe('signupSchema', () => {
    it('should accept valid signup data', () => {
      const result = signupSchema.safeParse({
        email: 'test@example.com',
        password: 'Password1',
        name: 'John Doe',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = signupSchema.safeParse({
        email: 'not-an-email',
        password: 'Password1',
        name: 'John',
      });
      expect(result.success).toBe(false);
    });

    it('should reject weak password - too short', () => {
      const result = signupSchema.safeParse({
        email: 'test@example.com',
        password: 'Pass1',
        name: 'John',
      });
      expect(result.success).toBe(false);
    });

    it('should reject password without uppercase', () => {
      const result = signupSchema.safeParse({
        email: 'test@example.com',
        password: 'password1',
        name: 'John',
      });
      expect(result.success).toBe(false);
    });

    it('should reject password without number', () => {
      const result = signupSchema.safeParse({
        email: 'test@example.com',
        password: 'Password',
        name: 'John',
      });
      expect(result.success).toBe(false);
    });

    it('should reject short name', () => {
      const result = signupSchema.safeParse({
        email: 'test@example.com',
        password: 'Password1',
        name: 'J',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should accept valid login data', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'any-password',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty password', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('refreshSchema', () => {
    it('should accept valid refresh token', () => {
      const result = refreshSchema.safeParse({
        refreshToken: 'some-token-string',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty refresh token', () => {
      const result = refreshSchema.safeParse({
        refreshToken: '',
      });
      expect(result.success).toBe(false);
    });
  });
});
