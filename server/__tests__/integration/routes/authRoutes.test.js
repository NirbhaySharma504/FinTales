/**
 * Integration Tests for Auth Routes
 * Tests: authRoutes.js with Express app integration
 */

const request = require('supertest');
const express = require('express');

// Create mock implementations
const mockUser = {
  _id: 'mock-user-id-123',
  firebaseUid: 'firebase-uid-123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user',
  xp: 500,
  profilePicture: 'https://example.com/pic.jpg',
  completedLessons: ['lesson1', 'lesson2'],
  preferences: {
    interests: {
      'Music Artists': ['Artist1'],
      'Movies/Series': [],
      'Comics & Anime': [],
      'Art Style': [],
      'Spending Habits': [],
      'Hobbies/Activities': []
    },
    difficulty: 'beginner',
    notifications: true
  },
  walletAddress: '0xabc123',
  mintedNfts: [],
  save: jest.fn().mockResolvedValue(true),
  toObject: jest.fn().mockReturnThis(),
  populate: jest.fn().mockResolvedValue(true)
};

// Mock all dependencies
jest.mock('../../../config/firebase-config', () => ({
  auth: jest.fn().mockReturnValue({
    verifyIdToken: jest.fn()
  })
}));

jest.mock('../../../models/userModel', () => {
  const mockUserModel = jest.fn().mockImplementation(() => mockUser);
  mockUserModel.findOne = jest.fn();
  mockUserModel.findById = jest.fn();
  mockUserModel.create = jest.fn();
  return mockUserModel;
});

jest.mock('../../../utils/saveUserProfile', () => ({
  saveUserProfileToFile: jest.fn().mockResolvedValue(true)
}));

const admin = require('../../../config/firebase-config');
const User = require('../../../models/userModel');
const authRoutes = require('../../../routes/authRoutes');

describe('Auth Routes - Integration Tests', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    
    // Error handler
    app.use((err, req, res, next) => {
      res.status(500).json({ success: false, message: err.message });
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    test('should authenticate new Google user successfully', async () => {
      const decodedToken = {
        uid: 'firebase-uid-123',
        email: 'newuser@gmail.com',
        name: 'New User',
        picture: 'https://example.com/photo.jpg',
        firebase: { sign_in_provider: 'google.com' }
      };

      admin.auth().verifyIdToken.mockResolvedValue(decodedToken);
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ idToken: 'valid-google-token' })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Google authentication successful');
    });

    test('should authenticate existing user', async () => {
      const decodedToken = {
        uid: 'firebase-uid-123',
        email: 'existing@gmail.com',
        name: 'Existing User',
        picture: 'https://example.com/photo.jpg',
        firebase: { sign_in_provider: 'google.com' }
      };

      const existingUser = { ...mockUser, save: jest.fn().mockResolvedValue(true) };

      admin.auth().verifyIdToken.mockResolvedValue(decodedToken);
      User.findOne.mockResolvedValue(existingUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ idToken: 'valid-token' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should reject request without idToken', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should reject non-Google sign-in', async () => {
      const decodedToken = {
        uid: 'firebase-uid',
        email: 'user@example.com',
        firebase: { sign_in_provider: 'password' }
      };

      admin.auth().verifyIdToken.mockResolvedValue(decodedToken);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ idToken: 'password-auth-token' });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Google sign-in');
    });

    test('should handle invalid token', async () => {
      admin.auth().verifyIdToken.mockRejectedValue(new Error('Invalid token'));

      const response = await request(app)
        .post('/api/auth/login')
        .send({ idToken: 'invalid-token' });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/auth/me (Protected Route)', () => {
    test('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('should reject request with invalid token format', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'InvalidFormat token');

      expect(response.status).toBe(401);
    });

    test('should return user profile with valid token', async () => {
      const decodedToken = { uid: 'firebase-uid-123' };
      
      admin.auth().verifyIdToken.mockResolvedValue(decodedToken);
      User.findOne.mockResolvedValue(mockUser);
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ ...mockUser, populate: jest.fn().mockResolvedValue(true), toObject: jest.fn().mockReturnValue(mockUser) })
      });

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('PUT /api/auth/preferences (Protected Route)', () => {
    test('should update user preferences', async () => {
      const decodedToken = { uid: 'firebase-uid-123' };
      const updatableUser = {
        ...mockUser,
        preferences: { interests: {} },
        save: jest.fn().mockResolvedValue(true),
        toObject: jest.fn().mockReturnValue({})
      };

      admin.auth().verifyIdToken.mockResolvedValue(decodedToken);
      User.findOne.mockResolvedValue(mockUser);
      User.findById.mockResolvedValue(updatableUser);

      const newInterests = {
        'Music Artists': ['Artist1', 'Artist2'],
        'Movies/Series': ['Movie1']
      };

      const response = await request(app)
        .put('/api/auth/preferences')
        .set('Authorization', 'Bearer valid-token')
        .send({ interests: newInterests });

      expect(response.status).toBe(200);
      expect(updatableUser.save).toHaveBeenCalled();
    });

    test('should reject without authentication', async () => {
      const response = await request(app)
        .put('/api/auth/preferences')
        .send({ interests: {} });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/auth/completed-lessons (Protected Route)', () => {
    test('should return completed lessons', async () => {
      const decodedToken = { uid: 'firebase-uid-123' };
      
      admin.auth().verifyIdToken.mockResolvedValue(decodedToken);
      User.findOne.mockResolvedValue(mockUser);
      User.findById.mockResolvedValue({
        ...mockUser,
        completedLessons: ['lesson1', 'lesson2']
      });

      const response = await request(app)
        .get('/api/auth/completed-lessons')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('completedLessons');
    });
  });

  describe('POST /api/auth/complete-lesson (Protected Route)', () => {
    test('should add completed lesson', async () => {
      const decodedToken = { uid: 'firebase-uid-123' };
      const savableUser = {
        ...mockUser,
        completedLessons: [],
        xp: 100,
        save: jest.fn().mockResolvedValue(true)
      };

      admin.auth().verifyIdToken.mockResolvedValue(decodedToken);
      User.findOne.mockResolvedValue(mockUser);
      User.findById.mockResolvedValue(savableUser);

      const response = await request(app)
        .post('/api/auth/complete-lesson')
        .set('Authorization', 'Bearer valid-token')
        .send({ lessonId: 'new-lesson-123' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should reject without lessonId', async () => {
      const decodedToken = { uid: 'firebase-uid-123' };
      
      admin.auth().verifyIdToken.mockResolvedValue(decodedToken);
      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/complete-lesson')
        .set('Authorization', 'Bearer valid-token')
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/add-xp (Protected Route)', () => {
    test('should add XP to user', async () => {
      const decodedToken = { uid: 'firebase-uid-123' };
      const savableUser = {
        ...mockUser,
        xp: 500,
        save: jest.fn().mockResolvedValue(true),
        toObject: jest.fn().mockReturnValue({ xp: 600 })
      };

      admin.auth().verifyIdToken.mockResolvedValue(decodedToken);
      User.findOne.mockResolvedValue(mockUser);
      User.findById.mockResolvedValue(savableUser);

      const response = await request(app)
        .post('/api/auth/add-xp')
        .set('Authorization', 'Bearer valid-token')
        .send({ xpAmount: 100 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should reject invalid XP amount', async () => {
      const decodedToken = { uid: 'firebase-uid-123' };
      
      admin.auth().verifyIdToken.mockResolvedValue(decodedToken);
      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/add-xp')
        .set('Authorization', 'Bearer valid-token')
        .send({ xpAmount: 'invalid' });

      expect(response.status).toBe(400);
    });
  });
});
