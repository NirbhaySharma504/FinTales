/**
 * Module Tests for Auth Middleware
 * Tests: authMiddleware.js
 */

// Mock dependencies before requiring the module
jest.mock('../../../config/firebase-config', () => ({
  auth: jest.fn().mockReturnValue({
    verifyIdToken: jest.fn()
  })
}));

jest.mock('../../../models/userModel', () => ({
  findOne: jest.fn()
}));

jest.mock('../../../utils/errorHandler', () => ({
  errorResponse: jest.fn((res, message, statusCode) => {
    res.status(statusCode).json({ success: false, message });
    return res;
  })
}));

const admin = require('../../../config/firebase-config');
const User = require('../../../models/userModel');
const { errorResponse } = require('../../../utils/errorHandler');
const { protect, admin: adminMiddleware } = require('../../../middleware/authMiddleware');

describe('Auth Middleware - Module Tests', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockReq = {
      headers: {},
      user: null
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
  });

  describe('protect Middleware', () => {
    test('should reject request without authorization header', async () => {
      await protect(mockReq, mockRes, mockNext);

      expect(errorResponse).toHaveBeenCalledWith(
        mockRes,
        'Not authorized, no token',
        401
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should reject request with invalid authorization header format', async () => {
      mockReq.headers.authorization = 'InvalidFormat token123';

      await protect(mockReq, mockRes, mockNext);

      expect(errorResponse).toHaveBeenCalledWith(
        mockRes,
        'Not authorized, no token',
        401
      );
    });

    test('should reject request with only Bearer keyword', async () => {
      mockReq.headers.authorization = 'Bearer';

      await protect(mockReq, mockRes, mockNext);

      expect(errorResponse).toHaveBeenCalled();
    });

    test('should verify token and attach user to request', async () => {
      const mockDecodedToken = {
        uid: 'firebase-uid-123',
        email: 'test@example.com'
      };

      const mockUser = {
        _id: 'user-id-123',
        firebaseUid: 'firebase-uid-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        preferences: { difficulty: 'beginner' }
      };

      mockReq.headers.authorization = 'Bearer valid-token';
      
      admin.auth().verifyIdToken.mockResolvedValue(mockDecodedToken);
      User.findOne.mockResolvedValue(mockUser);

      await protect(mockReq, mockRes, mockNext);

      expect(admin.auth().verifyIdToken).toHaveBeenCalledWith('valid-token');
      expect(User.findOne).toHaveBeenCalledWith({ firebaseUid: 'firebase-uid-123' });
      expect(mockReq.user).toEqual({
        id: mockUser._id,
        firebaseUid: mockUser.firebaseUid,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        preferences: mockUser.preferences
      });
      expect(mockNext).toHaveBeenCalled();
    });

    test('should reject when user not found in database', async () => {
      const mockDecodedToken = {
        uid: 'firebase-uid-123'
      };

      mockReq.headers.authorization = 'Bearer valid-token';
      
      admin.auth().verifyIdToken.mockResolvedValue(mockDecodedToken);
      User.findOne.mockResolvedValue(null);

      await protect(mockReq, mockRes, mockNext);

      expect(errorResponse).toHaveBeenCalledWith(
        mockRes,
        'User not found in database',
        404
      );
    });

    test('should handle token verification failure', async () => {
      mockReq.headers.authorization = 'Bearer invalid-token';
      
      admin.auth().verifyIdToken.mockRejectedValue(new Error('Invalid token'));

      await protect(mockReq, mockRes, mockNext);

      expect(errorResponse).toHaveBeenCalledWith(
        mockRes,
        'Not authorized, token failed',
        401
      );
    });

    test('should handle Firebase auth errors', async () => {
      mockReq.headers.authorization = 'Bearer expired-token';
      
      admin.auth().verifyIdToken.mockRejectedValue({
        code: 'auth/id-token-expired',
        message: 'Token expired'
      });

      await protect(mockReq, mockRes, mockNext);

      expect(errorResponse).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('admin Middleware', () => {
    test('should allow admin users to proceed', () => {
      mockReq.user = {
        id: 'user-id-123',
        role: 'admin'
      };

      adminMiddleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    test('should reject non-admin users', () => {
      mockReq.user = {
        id: 'user-id-123',
        role: 'user'
      };

      adminMiddleware(mockReq, mockRes, mockNext);

      expect(errorResponse).toHaveBeenCalledWith(
        mockRes,
        'Not authorized as an admin',
        403
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should reject when user object is missing', () => {
      mockReq.user = null;

      adminMiddleware(mockReq, mockRes, mockNext);

      expect(errorResponse).toHaveBeenCalledWith(
        mockRes,
        'Not authorized as an admin',
        403
      );
    });

    test('should reject when role is undefined', () => {
      mockReq.user = {
        id: 'user-id-123'
        // role is missing
      };

      adminMiddleware(mockReq, mockRes, mockNext);

      expect(errorResponse).toHaveBeenCalledWith(
        mockRes,
        'Not authorized as an admin',
        403
      );
    });
  });

  describe('Token Extraction', () => {
    test('should extract token from Bearer format correctly', async () => {
      const mockDecodedToken = { uid: 'test-uid' };
      const mockUser = {
        _id: 'user-id',
        firebaseUid: 'test-uid',
        email: 'test@test.com',
        name: 'Test',
        role: 'user',
        preferences: {}
      };

      mockReq.headers.authorization = 'Bearer my-test-token-123';
      
      admin.auth().verifyIdToken.mockResolvedValue(mockDecodedToken);
      User.findOne.mockResolvedValue(mockUser);

      await protect(mockReq, mockRes, mockNext);

      expect(admin.auth().verifyIdToken).toHaveBeenCalledWith('my-test-token-123');
    });

    test('should handle token with special characters', async () => {
      const mockDecodedToken = { uid: 'test-uid' };
      const mockUser = {
        _id: 'user-id',
        firebaseUid: 'test-uid',
        email: 'test@test.com',
        name: 'Test',
        role: 'user',
        preferences: {}
      };

      const tokenWithSpecialChars = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.signature';
      mockReq.headers.authorization = `Bearer ${tokenWithSpecialChars}`;
      
      admin.auth().verifyIdToken.mockResolvedValue(mockDecodedToken);
      User.findOne.mockResolvedValue(mockUser);

      await protect(mockReq, mockRes, mockNext);

      expect(admin.auth().verifyIdToken).toHaveBeenCalledWith(tokenWithSpecialChars);
    });
  });
});
