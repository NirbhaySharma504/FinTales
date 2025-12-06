/**
 * Module Tests for Auth Controller
 * Tests: authController.js
 */

// Mock dependencies
jest.mock('../../../models/userModel');
jest.mock('../../../config/firebase-config', () => ({
  auth: jest.fn().mockReturnValue({
    verifyIdToken: jest.fn()
  })
}));
jest.mock('../../../utils/saveUserProfile', () => ({
  saveUserProfileToFile: jest.fn()
}));
jest.mock('../../../utils/errorHandler', () => ({
  successResponse: jest.fn((res, message, data, statusCode = 200) => {
    return res.status(statusCode).json({ success: true, message, data });
  }),
  errorResponse: jest.fn((res, message, statusCode = 500) => {
    return res.status(statusCode).json({ success: false, message });
  })
}));

const User = require('../../../models/userModel');
const admin = require('../../../config/firebase-config');
const { saveUserProfileToFile } = require('../../../utils/saveUserProfile');
const { successResponse, errorResponse } = require('../../../utils/errorHandler');
const {
  authenticateUser,
  getCurrentUser,
  updatePreferences,
  getCompletedLessons,
  addCompletedLesson,
  addUserXP
} = require('../../../controllers/authController');

describe('Auth Controller - Module Tests', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockReq = {
      body: {},
      user: { id: 'user-123' }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('authenticateUser', () => {
    test('should reject when idToken is missing', async () => {
      mockReq.body = {};

      await authenticateUser(mockReq, mockRes);

      expect(errorResponse).toHaveBeenCalledWith(
        mockRes,
        'ID token is required',
        400
      );
    });

    test('should reject non-Google sign-in', async () => {
      mockReq.body = { idToken: 'test-token' };
      
      admin.auth().verifyIdToken.mockResolvedValue({
        uid: 'firebase-uid',
        email: 'test@test.com',
        firebase: { sign_in_provider: 'password' }
      });

      await authenticateUser(mockReq, mockRes);

      expect(errorResponse).toHaveBeenCalledWith(
        mockRes,
        'Only Google sign-in is supported',
        400
      );
    });

    test('should create new user for first-time Google sign-in', async () => {
      mockReq.body = { idToken: 'valid-token' };
      
      const decodedToken = {
        uid: 'firebase-uid-123',
        email: 'newuser@gmail.com',
        name: 'New User',
        picture: 'https://example.com/photo.jpg',
        firebase: { sign_in_provider: 'google.com' }
      };

      const newUser = {
        _id: 'new-user-id',
        firebaseUid: 'firebase-uid-123',
        email: 'newuser@gmail.com',
        name: 'New User',
        profilePicture: 'https://example.com/photo.jpg',
        xp: 0
      };

      admin.auth().verifyIdToken.mockResolvedValue(decodedToken);
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(newUser);

      await authenticateUser(mockReq, mockRes);

      expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
        firebaseUid: 'firebase-uid-123',
        email: 'newuser@gmail.com',
        name: 'New User'
      }));
      expect(successResponse).toHaveBeenCalledWith(
        mockRes,
        'Google authentication successful',
        { user: newUser }
      );
    });

    test('should update existing user on Google sign-in', async () => {
      mockReq.body = { idToken: 'valid-token' };
      
      const decodedToken = {
        uid: 'firebase-uid-123',
        email: 'existinguser@gmail.com',
        name: 'Updated Name',
        picture: 'https://example.com/new-photo.jpg',
        firebase: { sign_in_provider: 'google.com' }
      };

      const existingUser = {
        _id: 'existing-user-id',
        firebaseUid: 'firebase-uid-123',
        email: 'existinguser@gmail.com',
        name: 'Old Name',
        profilePicture: 'https://example.com/old-photo.jpg',
        save: jest.fn().mockResolvedValue(true)
      };

      admin.auth().verifyIdToken.mockResolvedValue(decodedToken);
      User.findOne.mockResolvedValue(existingUser);

      await authenticateUser(mockReq, mockRes);

      expect(existingUser.save).toHaveBeenCalled();
      expect(existingUser.email).toBe('existinguser@gmail.com');
      expect(existingUser.name).toBe('Updated Name');
    });

    test('should handle Firebase token verification error', async () => {
      mockReq.body = { idToken: 'invalid-token' };
      
      admin.auth().verifyIdToken.mockRejectedValue(new Error('Invalid token'));

      await authenticateUser(mockReq, mockRes);

      expect(errorResponse).toHaveBeenCalledWith(
        mockRes,
        'Invalid token',
        401
      );
    });
  });

  describe('getCurrentUser', () => {
    test('should return user profile successfully', async () => {
      const mockUser = {
        _id: 'user-123',
        name: 'Test User',
        email: 'test@test.com',
        xp: 500,
        ownedNFTs: [],
        populate: jest.fn().mockResolvedValue(true),
        toObject: jest.fn().mockReturnValue({ name: 'Test User' })
      };

      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });
      saveUserProfileToFile.mockResolvedValue(true);

      await getCurrentUser(mockReq, mockRes);

      expect(User.findById).toHaveBeenCalledWith('user-123');
      expect(successResponse).toHaveBeenCalledWith(
        mockRes,
        'User profile retrieved',
        { user: mockUser }
      );
    });

    test('should return 404 when user not found', async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await getCurrentUser(mockReq, mockRes);

      expect(errorResponse).toHaveBeenCalledWith(
        mockRes,
        'User not found',
        404
      );
    });

    test('should handle database errors', async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await getCurrentUser(mockReq, mockRes);

      expect(errorResponse).toHaveBeenCalled();
    });
  });

  describe('updatePreferences', () => {
    test('should update user preferences successfully', async () => {
      const newInterests = {
        'Music Artists': ['Artist1', 'Artist2'],
        'Movies/Series': ['Movie1']
      };

      mockReq.body = { interests: newInterests };

      const mockUser = {
        _id: 'user-123',
        preferences: {
          interests: {},
          difficulty: 'beginner'
        },
        save: jest.fn().mockResolvedValue(true),
        toObject: jest.fn().mockReturnValue({})
      };

      User.findById.mockResolvedValue(mockUser);
      saveUserProfileToFile.mockResolvedValue(true);

      await updatePreferences(mockReq, mockRes);

      expect(mockUser.save).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    test('should return 404 when user not found', async () => {
      mockReq.body = { interests: {} };
      User.findById.mockResolvedValue(null);

      await updatePreferences(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe('getCompletedLessons', () => {
    test('should return completed lessons', async () => {
      const mockUser = {
        _id: 'user-123',
        completedLessons: ['lesson1', 'lesson2', 'lesson3']
      };

      User.findById.mockResolvedValue(mockUser);

      await getCompletedLessons(mockReq, mockRes);

      expect(successResponse).toHaveBeenCalledWith(
        mockRes,
        'Completed lessons retrieved successfully',
        { completedLessons: ['lesson1', 'lesson2', 'lesson3'] }
      );
    });

    test('should return 404 when user not found', async () => {
      User.findById.mockResolvedValue(null);

      await getCompletedLessons(mockReq, mockRes);

      expect(errorResponse).toHaveBeenCalledWith(
        mockRes,
        'User not found',
        404
      );
    });
  });

  describe('addCompletedLesson', () => {
    test('should add lesson to completed list', async () => {
      mockReq.body = { lessonId: 'lesson-456' };

      const mockUser = {
        _id: 'user-123',
        completedLessons: ['lesson-123'],
        xp: 100,
        save: jest.fn().mockResolvedValue(true)
      };

      User.findById.mockResolvedValue(mockUser);

      await addCompletedLesson(mockReq, mockRes);

      expect(mockUser.completedLessons).toContain('lesson-456');
      expect(mockUser.xp).toBe(150); // 100 + 50
      expect(mockUser.save).toHaveBeenCalled();
    });

    test('should not add duplicate lesson', async () => {
      mockReq.body = { lessonId: 'lesson-123' };

      const mockUser = {
        _id: 'user-123',
        completedLessons: ['lesson-123'],
        xp: 100,
        save: jest.fn().mockResolvedValue(true)
      };

      User.findById.mockResolvedValue(mockUser);

      await addCompletedLesson(mockReq, mockRes);

      // Should not duplicate the lesson
      expect(mockUser.completedLessons.filter(l => l === 'lesson-123').length).toBe(1);
    });

    test('should return 400 when lessonId is missing', async () => {
      mockReq.body = {};

      await addCompletedLesson(mockReq, mockRes);

      expect(errorResponse).toHaveBeenCalledWith(
        mockRes,
        'Lesson ID is required',
        400
      );
    });
  });

  describe('addUserXP', () => {
    test('should add XP to user successfully', async () => {
      mockReq.body = { xpAmount: 100 };

      const mockUser = {
        _id: 'user-123',
        xp: 500,
        save: jest.fn().mockResolvedValue(true),
        toObject: jest.fn().mockReturnValue({ xp: 600 })
      };

      User.findById.mockResolvedValue(mockUser);
      saveUserProfileToFile.mockResolvedValue(true);

      await addUserXP(mockReq, mockRes);

      expect(mockUser.xp).toBe(600);
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    test('should reject invalid XP amount', async () => {
      mockReq.body = { xpAmount: 'invalid' };

      await addUserXP(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test('should reject missing XP amount', async () => {
      mockReq.body = {};

      await addUserXP(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test('should return 404 when user not found', async () => {
      mockReq.body = { xpAmount: 100 };
      User.findById.mockResolvedValue(null);

      await addUserXP(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    test('should handle user with no existing XP', async () => {
      mockReq.body = { xpAmount: 50 };

      const mockUser = {
        _id: 'user-123',
        xp: undefined, // No existing XP
        save: jest.fn().mockResolvedValue(true),
        toObject: jest.fn().mockReturnValue({ xp: 50 })
      };

      User.findById.mockResolvedValue(mockUser);
      saveUserProfileToFile.mockResolvedValue(true);

      await addUserXP(mockReq, mockRes);

      expect(mockUser.xp).toBe(50); // 0 + 50
    });
  });
});
