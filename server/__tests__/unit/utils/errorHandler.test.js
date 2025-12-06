/**
 * Unit Tests for Error Handler Utility
 * Tests: errorHandler.js
 */

const { successResponse, errorResponse, formatValidationErrors } = require('../../../utils/errorHandler');

describe('Error Handler Utility - Unit Tests', () => {
  let mockRes;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('successResponse', () => {
    test('should return success response with default values', () => {
      successResponse(mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Success',
        data: {}
      });
    });

    test('should return success response with custom message', () => {
      successResponse(mockRes, 'User created successfully');

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'User created successfully',
        data: {}
      });
    });

    test('should return success response with data', () => {
      const testData = { user: { id: '123', name: 'John' } };
      successResponse(mockRes, 'User found', testData);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'User found',
        data: testData
      });
    });

    test('should return success response with custom status code', () => {
      successResponse(mockRes, 'Created', {}, 201);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Created',
        data: {}
      });
    });
  });

  describe('errorResponse', () => {
    test('should return error response with default values', () => {
      errorResponse(mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error',
        errors: undefined
      });
    });

    test('should return error response with custom message', () => {
      errorResponse(mockRes, 'User not found', 404);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found',
        errors: undefined
      });
    });

    test('should return error response with validation errors', () => {
      const errors = [
        { field: 'email', message: 'Invalid email' },
        { field: 'password', message: 'Password too short' }
      ];
      errorResponse(mockRes, 'Validation failed', 400, errors);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    });

    test('should return 401 for unauthorized errors', () => {
      errorResponse(mockRes, 'Unauthorized', 401);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthorized',
        errors: undefined
      });
    });
  });

  describe('formatValidationErrors', () => {
    test('should format express-validator errors correctly', () => {
      const validationErrors = [
        { param: 'email', msg: 'Email is required' },
        { param: 'password', msg: 'Password must be at least 6 characters' }
      ];

      const result = formatValidationErrors(validationErrors);

      expect(result).toEqual([
        { field: 'email', message: 'Email is required' },
        { field: 'password', message: 'Password must be at least 6 characters' }
      ]);
    });

    test('should return empty array for null input', () => {
      const result = formatValidationErrors(null);
      expect(result).toEqual([]);
    });

    test('should return empty array for undefined input', () => {
      const result = formatValidationErrors(undefined);
      expect(result).toEqual([]);
    });

    test('should return empty array for non-array input', () => {
      const result = formatValidationErrors('not an array');
      expect(result).toEqual([]);
    });

    test('should return empty array for empty array input', () => {
      const result = formatValidationErrors([]);
      expect(result).toEqual([]);
    });
  });
});
