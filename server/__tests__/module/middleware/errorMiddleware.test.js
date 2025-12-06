/**
 * Module Tests for Error Middleware
 * Tests: errorMiddleware.js
 */

const { notFound, errorHandler } = require('../../../middleware/errorMiddleware');

describe('Error Middleware - Module Tests', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      originalUrl: '/api/test/endpoint'
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      statusCode: 200
    };
    mockNext = jest.fn();
  });

  describe('notFound Middleware', () => {
    test('should create 404 error for unknown routes', () => {
      notFound(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockNext).toHaveBeenCalled();
      
      const errorArg = mockNext.mock.calls[0][0];
      expect(errorArg).toBeInstanceOf(Error);
      expect(errorArg.message).toContain('Not Found');
      expect(errorArg.message).toContain('/api/test/endpoint');
    });

    test('should include original URL in error message', () => {
      mockReq.originalUrl = '/api/unknown/route';
      notFound(mockReq, mockRes, mockNext);

      const errorArg = mockNext.mock.calls[0][0];
      expect(errorArg.message).toContain('/api/unknown/route');
    });

    test('should handle root URL', () => {
      mockReq.originalUrl = '/';
      notFound(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockNext).toHaveBeenCalled();
    });

    test('should handle nested URLs', () => {
      mockReq.originalUrl = '/api/v1/users/123/profile';
      notFound(mockReq, mockRes, mockNext);

      const errorArg = mockNext.mock.calls[0][0];
      expect(errorArg.message).toContain('/api/v1/users/123/profile');
    });
  });

  describe('errorHandler Middleware', () => {
    test('should handle errors with 500 status when res.statusCode is 200', () => {
      const error = new Error('Internal server error');
      mockRes.statusCode = 200;

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Internal server error'
      }));
    });

    test('should preserve existing status code when not 200', () => {
      const error = new Error('Not found');
      mockRes.statusCode = 404;

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    test('should include stack trace in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new Error('Test error');
      error.stack = 'Error stack trace';

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        stack: 'Error stack trace'
      }));

      process.env.NODE_ENV = originalEnv;
    });

    test('should hide stack trace in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = new Error('Test error');
      error.stack = 'Error stack trace';

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        stack: null
      }));

      process.env.NODE_ENV = originalEnv;
    });

    test('should handle error without message', () => {
      const error = new Error();

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false
      }));
    });

    test('should handle 401 unauthorized errors', () => {
      const error = new Error('Unauthorized');
      mockRes.statusCode = 401;

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Unauthorized'
      }));
    });

    test('should handle 403 forbidden errors', () => {
      const error = new Error('Forbidden');
      mockRes.statusCode = 403;

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
    });

    test('should handle 400 bad request errors', () => {
      const error = new Error('Bad request');
      mockRes.statusCode = 400;

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('Middleware Chain Integration', () => {
    test('notFound should work with errorHandler', () => {
      // First, notFound creates the error
      notFound(mockReq, mockRes, mockNext);

      // Get the error that was passed to next
      const error = mockNext.mock.calls[0][0];

      // Reset mockRes for errorHandler
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        statusCode: 404
      };

      // Then errorHandler processes it
      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: expect.stringContaining('Not Found')
      }));
    });
  });
});
