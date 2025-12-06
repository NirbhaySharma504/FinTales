/**
 * Unit Tests for API Response Utility
 * Tests: apiResponse.js
 */

const { AppError, asyncHandler, handleMongooseError } = require('../../../utils/apiResponse');

describe('API Response Utility - Unit Tests', () => {
  describe('AppError Class', () => {
    test('should create error with message and status code', () => {
      const error = new AppError('Not found', 404);

      expect(error.message).toBe('Not found');
      expect(error.statusCode).toBe(404);
      expect(error.status).toBe('fail');
      expect(error.isOperational).toBe(true);
      expect(error).toBeInstanceOf(Error);
    });

    test('should set status to "fail" for 4xx errors', () => {
      const error400 = new AppError('Bad request', 400);
      const error401 = new AppError('Unauthorized', 401);
      const error403 = new AppError('Forbidden', 403);
      const error404 = new AppError('Not found', 404);

      expect(error400.status).toBe('fail');
      expect(error401.status).toBe('fail');
      expect(error403.status).toBe('fail');
      expect(error404.status).toBe('fail');
    });

    test('should set status to "error" for 5xx errors', () => {
      const error500 = new AppError('Internal server error', 500);
      const error502 = new AppError('Bad gateway', 502);
      const error503 = new AppError('Service unavailable', 503);

      expect(error500.status).toBe('error');
      expect(error502.status).toBe('error');
      expect(error503.status).toBe('error');
    });

    test('should capture stack trace', () => {
      const error = new AppError('Test error', 500);
      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe('string');
      expect(error.stack.length).toBeGreaterThan(0);
    });
  });

  describe('asyncHandler', () => {
    test('should pass successful async function result', async () => {
      const mockReq = {};
      const mockRes = { json: jest.fn() };
      const mockNext = jest.fn();

      const asyncFn = async (req, res, next) => {
        res.json({ success: true });
      };

      const wrappedFn = asyncHandler(asyncFn);
      await wrappedFn(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({ success: true });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should catch and pass errors to next', async () => {
      const mockReq = {};
      const mockRes = {};
      const mockNext = jest.fn();
      const testError = new Error('Test error');

      const asyncFn = async (req, res, next) => {
        throw testError;
      };

      const wrappedFn = asyncHandler(asyncFn);
      await wrappedFn(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(testError);
    });

    test('should handle rejected promises', async () => {
      const mockReq = {};
      const mockRes = {};
      const mockNext = jest.fn();
      const testError = new Error('Promise rejection');

      const asyncFn = async (req, res, next) => {
        return Promise.reject(testError);
      };

      const wrappedFn = asyncHandler(asyncFn);
      await wrappedFn(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(testError);
    });
  });

  describe('handleMongooseError', () => {
    test('should handle CastError (invalid ObjectId)', () => {
      const mongoError = {
        name: 'CastError',
        value: 'invalid-id',
        message: 'Cast to ObjectId failed'
      };

      const result = handleMongooseError(mongoError);

      expect(result.statusCode).toBe(404);
      expect(result.message).toContain('invalid-id');
    });

    test('should handle ValidationError', () => {
      const mongoError = {
        name: 'ValidationError',
        errors: {
          email: { message: 'Email is required' },
          name: { message: 'Name is required' }
        },
        message: 'Validation failed'
      };

      const result = handleMongooseError(mongoError);

      expect(result.statusCode).toBe(400);
      expect(result.message).toContain('Email is required');
      expect(result.message).toContain('Name is required');
    });

    test('should handle duplicate key error (code 11000)', () => {
      const mongoError = {
        code: 11000,
        keyValue: { email: 'test@test.com' },
        message: 'Duplicate key error'
      };

      const result = handleMongooseError(mongoError);

      expect(result.statusCode).toBe(400);
      expect(result.message).toContain('Duplicate field value');
      expect(result.message).toContain('test@test.com');
    });

    test('should return original error for unknown error types', () => {
      const unknownError = {
        name: 'UnknownError',
        message: 'Unknown error occurred'
      };

      const result = handleMongooseError(unknownError);

      expect(result.message).toBe('Unknown error occurred');
    });
  });
});
