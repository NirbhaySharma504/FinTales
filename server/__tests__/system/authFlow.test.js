/**
 * System Tests for Authentication Flow
 * Tests: Complete authentication flow from login to protected resources
 */

const request = require('supertest');
const express = require('express');

// Mock all dependencies
jest.mock('../../config/firebase-config', () => ({
  auth: jest.fn().mockReturnValue({
    verifyIdToken: jest.fn()
  })
}));

jest.mock('../../models/userModel', () => {
  const mockUser = {
    _id: 'user-123',
    firebaseUid: 'firebase-uid-123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    xp: 500,
    preferences: { difficulty: 'beginner' },
    completedLessons: ['lesson1'],
    save: jest.fn().mockResolvedValue(true),
    toObject: jest.fn().mockReturnThis(),
    populate: jest.fn().mockResolvedValue(true)
  };
  
  const Model = jest.fn().mockImplementation(() => mockUser);
  Model.findOne = jest.fn();
  Model.findById = jest.fn();
  Model.create = jest.fn();
  return Model;
});

jest.mock('../../utils/saveUserProfile', () => ({
  saveUserProfileToFile: jest.fn().mockResolvedValue(true)
}));

const admin = require('../../config/firebase-config');
const User = require('../../models/userModel');
const authRoutes = require('../../routes/authRoutes');
const nftRoutes = require('../../routes/nftRoutes');

describe('Authentication Flow - System Tests', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    app.use('/api/nfts', nftRoutes);
    
    app.use((err, req, res, next) => {
      res.status(500).json({ success: false, message: err.message });
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Authentication Flow', () => {
    test('should complete full login -> access protected resource flow', async () => {
      // Step 1: User logs in with Google
      const decodedToken = {
        uid: 'firebase-uid-123',
        email: 'newuser@gmail.com',
        name: 'New User',
        picture: 'https://example.com/photo.jpg',
        firebase: { sign_in_provider: 'google.com' }
      };

      const newUser = {
        _id: 'new-user-123',
        firebaseUid: 'firebase-uid-123',
        email: 'newuser@gmail.com',
        name: 'New User',
        role: 'user',
        preferences: {},
        save: jest.fn().mockResolvedValue(true),
        toObject: jest.fn().mockReturnThis()
      };

      admin.auth().verifyIdToken.mockResolvedValue(decodedToken);
      User.findOne.mockResolvedValue(null); // First time user
      User.create.mockResolvedValue(newUser);

      // Login request
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ idToken: 'google-id-token' });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.success).toBe(true);

      // Step 2: Access protected resource with the same token
      User.findOne.mockResolvedValue(newUser);
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          ...newUser,
          populate: jest.fn().mockResolvedValue(true),
          toObject: jest.fn().mockReturnValue(newUser)
        })
      });

      const profileResponse = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer google-id-token');

      expect(profileResponse.status).toBe(200);
      expect(profileResponse.body.success).toBe(true);
    });

    test('should reject access without authentication', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('should reject access with invalid token', async () => {
      admin.auth().verifyIdToken.mockRejectedValue(new Error('Invalid token'));

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });

    test('should reject access when user not in database', async () => {
      const decodedToken = { uid: 'unknown-uid' };
      admin.auth().verifyIdToken.mockResolvedValue(decodedToken);
      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(404);
    });
  });

  describe('Token Handling', () => {
    test('should extract Bearer token correctly', async () => {
      const decodedToken = { uid: 'firebase-uid-123' };
      const mockUser = {
        _id: 'user-123',
        firebaseUid: 'firebase-uid-123',
        email: 'test@test.com',
        name: 'Test',
        role: 'user',
        preferences: {}
      };

      admin.auth().verifyIdToken.mockResolvedValue(decodedToken);
      User.findOne.mockResolvedValue(mockUser);
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          ...mockUser,
          populate: jest.fn().mockResolvedValue(true),
          toObject: jest.fn().mockReturnValue(mockUser)
        })
      });

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer my-test-token');

      expect(admin.auth().verifyIdToken).toHaveBeenCalledWith('my-test-token');
    });

    test('should reject malformed Authorization header', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Basic user:pass');

      expect(response.status).toBe(401);
    });

    test('should reject empty Bearer token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer ');

      expect(response.status).toBe(401);
    });
  });

  describe('User Session Persistence', () => {
    test('should maintain user context across multiple requests', async () => {
      const decodedToken = { uid: 'firebase-uid-123' };
      const mockUser = {
        _id: 'user-123',
        firebaseUid: 'firebase-uid-123',
        email: 'test@test.com',
        name: 'Test',
        role: 'user',
        xp: 100,
        completedLessons: [],
        preferences: { interests: {} },
        save: jest.fn().mockResolvedValue(true),
        toObject: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(true)
      };

      admin.auth().verifyIdToken.mockResolvedValue(decodedToken);
      User.findOne.mockResolvedValue(mockUser);

      // Request 1: Get profile
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          ...mockUser,
          populate: jest.fn().mockResolvedValue(true),
          toObject: jest.fn().mockReturnValue(mockUser)
        })
      });

      const response1 = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer valid-token');

      expect(response1.status).toBe(200);

      // Request 2: Update preferences
      User.findById.mockResolvedValue(mockUser);

      const response2 = await request(app)
        .put('/api/auth/preferences')
        .set('Authorization', 'Bearer valid-token')
        .send({ interests: { 'Music Artists': ['Artist1'] } });

      expect(response2.status).toBe(200);

      // Request 3: Get completed lessons
      User.findById.mockResolvedValue(mockUser);

      const response3 = await request(app)
        .get('/api/auth/completed-lessons')
        .set('Authorization', 'Bearer valid-token');

      expect(response3.status).toBe(200);
    });
  });

  describe('Error Recovery', () => {
    test('should recover from temporary Firebase outage', async () => {
      const decodedToken = { uid: 'firebase-uid-123' };
      const mockUser = {
        _id: 'user-123',
        firebaseUid: 'firebase-uid-123',
        email: 'test@test.com',
        name: 'Test',
        role: 'user',
        preferences: {}
      };

      // First request fails
      admin.auth().verifyIdToken.mockRejectedValueOnce(new Error('Service unavailable'));

      const failedResponse = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer valid-token');

      expect(failedResponse.status).toBe(401);

      // Second request succeeds
      admin.auth().verifyIdToken.mockResolvedValueOnce(decodedToken);
      User.findOne.mockResolvedValue(mockUser);
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          ...mockUser,
          populate: jest.fn().mockResolvedValue(true),
          toObject: jest.fn().mockReturnValue(mockUser)
        })
      });

      const successResponse = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer valid-token');

      expect(successResponse.status).toBe(200);
    });
  });
});
