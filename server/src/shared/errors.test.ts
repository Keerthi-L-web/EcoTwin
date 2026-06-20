import { describe, it, expect } from 'vitest';
import { AppError, NotFoundError, UnauthorizedError, ForbiddenError, ValidationError, ConflictError } from '../shared/errors';

describe('Custom Errors', () => {
  it('AppError should have correct status code', () => {
    const err = new AppError('test', 400);
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('test');
    expect(err.isOperational).toBe(true);
  });

  it('NotFoundError should return 404', () => {
    const err = new NotFoundError('User');
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('User not found');
  });

  it('UnauthorizedError should return 401', () => {
    const err = new UnauthorizedError();
    expect(err.statusCode).toBe(401);
  });

  it('ForbiddenError should return 403', () => {
    const err = new ForbiddenError();
    expect(err.statusCode).toBe(403);
  });

  it('ValidationError should return 400', () => {
    const err = new ValidationError('Invalid input');
    expect(err.statusCode).toBe(400);
  });

  it('ConflictError should return 409', () => {
    const err = new ConflictError('Already exists');
    expect(err.statusCode).toBe(409);
  });
});
