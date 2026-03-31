import { describe, it, expect } from 'vitest';
import {
  NotFoundError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  InvalidStateTransitionError,
  isAppError,
  toErrorResponse,
} from '@/lib/errors';

describe('Error Types', () => {
  describe('NotFoundError', () => {
    it('creates with resource name and id', () => {
      const error = new NotFoundError('Patient', '123');
      expect(error.message).toBe("Patient with id '123' not found");
      expect(error.code).toBe('NOT_FOUND');
      expect(error.statusCode).toBe(404);
    });

    it('creates with resource name only', () => {
      const error = new NotFoundError('Patient');
      expect(error.message).toBe('Patient not found');
    });
  });

  describe('ValidationError', () => {
    it('creates with message and details', () => {
      const details = [{ field: 'email', message: 'invalid' }];
      const error = new ValidationError('Invalid input', details);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual(details);
    });
  });

  describe('AuthenticationError', () => {
    it('creates with default message', () => {
      const error = new AuthenticationError();
      expect(error.message).toBe('Authentication required');
      expect(error.statusCode).toBe(401);
    });
  });

  describe('AuthorizationError', () => {
    it('creates with default message', () => {
      const error = new AuthorizationError();
      expect(error.message).toBe('Insufficient permissions');
      expect(error.statusCode).toBe(403);
    });
  });

  describe('InvalidStateTransitionError', () => {
    it('creates with transition details', () => {
      const error = new InvalidStateTransitionError('Encounter', 'scheduled', 'signed');
      expect(error.message).toBe("Invalid state transition for Encounter: 'scheduled' → 'signed'");
      expect(error.statusCode).toBe(409);
    });
  });

  describe('isAppError', () => {
    it('returns true for AppError instances', () => {
      expect(isAppError(new NotFoundError('Test'))).toBe(true);
      expect(isAppError(new ValidationError('Test'))).toBe(true);
    });

    it('returns false for regular errors', () => {
      expect(isAppError(new Error('Test'))).toBe(false);
      expect(isAppError('string')).toBe(false);
      expect(isAppError(null)).toBe(false);
    });
  });

  describe('toErrorResponse', () => {
    it('converts AppError to response', () => {
      const error = new NotFoundError('Patient', '123');
      const response = toErrorResponse(error);
      expect(response.message).toBe("Patient with id '123' not found");
      expect(response.code).toBe('NOT_FOUND');
      expect(response.statusCode).toBe(404);
    });

    it('sanitizes unknown errors', () => {
      const response = toErrorResponse(new Error('Internal DB error'));
      expect(response.message).toBe('An unexpected error occurred');
      expect(response.code).toBe('INTERNAL_ERROR');
      expect(response.statusCode).toBe(500);
    });
  });
});
