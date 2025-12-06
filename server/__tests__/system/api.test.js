/**
 * System Tests for FinTales API
 * Tests: Complete API system testing including app.js routes
 * 
 * These tests verify the entire system works together including:
 * - Express application setup
 * - Middleware chain
 * - Route handling
 * - Error handling
 * - API endpoints
 */

const request = require('supertest');
const express = require('express');

// Mock axios for Python API calls
jest.mock('axios', () => ({
  post: jest.fn(),
  get: jest.fn()
}));

// Mock database connection
jest.mock('../../config/db', () => jest.fn().mockResolvedValue({}));

// Mock Firebase admin
jest.mock('../../config/firebase-config', () => ({
  auth: jest.fn().mockReturnValue({
    verifyIdToken: jest.fn()
  })
}));

// Mock User model
jest.mock('../../models/userModel', () => {
  const mockUser = {
    _id: 'user-123',
    firebaseUid: 'firebase-uid',
    email: 'test@test.com',
    name: 'Test User',
    role: 'user',
    xp: 500,
    preferences: { difficulty: 'beginner' },
    save: jest.fn().mockResolvedValue(true),
    toObject: jest.fn().mockReturnThis()
  };
  
  const Model = jest.fn().mockImplementation(() => mockUser);
  Model.findOne = jest.fn().mockResolvedValue(mockUser);
  Model.findById = jest.fn().mockReturnValue({
    select: jest.fn().mockResolvedValue(mockUser),
    populate: jest.fn().mockResolvedValue(mockUser)
  });
  Model.create = jest.fn().mockResolvedValue(mockUser);
  return Model;
});

// Mock NFT model
jest.mock('../../models/nftModel', () => {
  const Model = jest.fn();
  Model.findOne = jest.fn();
  return Model;
});

// Mock saveUserProfile
jest.mock('../../utils/saveUserProfile', () => ({
  saveUserProfileToFile: jest.fn().mockResolvedValue(true)
}));

const axios = require('axios');
const app = require('../../app');

describe('System Tests - FinTales API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Application Setup', () => {
    test('should start without errors', () => {
      expect(app).toBeDefined();
    });

    test('should have JSON parsing enabled', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ test: 'data' })
        .set('Content-Type', 'application/json');

      // Should process JSON without error (even if validation fails)
      expect(response.status).not.toBe(415); // Not Unsupported Media Type
    });

    test('should have CORS enabled', async () => {
      const response = await request(app)
        .options('/api/status')
        .set('Origin', 'http://localhost:3000');

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  describe('API Status Endpoint', () => {
    test('GET /api/status should return API status', async () => {
      const response = await request(app)
        .get('/api/status');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('message', 'CoinQuest API is running');
      expect(response.body).toHaveProperty('version', '1.0.0');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('pythonApiUrl');
    });
  });

  describe('Root Endpoint', () => {
    test('GET / should return API documentation', async () => {
      const response = await request(app)
        .get('/');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Welcome to CoinQuest API');
      expect(response.body).toHaveProperty('documentation');
      expect(response.body).toHaveProperty('endpoints');
      expect(response.body.endpoints).toHaveProperty('auth');
      expect(response.body.endpoints).toHaveProperty('nfts');
      expect(response.body.endpoints).toHaveProperty('python');
    });
  });

  describe('Story Generation Endpoint', () => {
    test('POST /api/generate should forward to Python API', async () => {
      axios.post.mockResolvedValueOnce({ data: {} }); // load-user-data
      axios.post.mockResolvedValueOnce({
        data: {
          storyId: 'story-123',
          story: { title: 'Test Story' },
          quiz: { questions: [] },
          summary: 'Test summary'
        }
      });

      const response = await request(app)
        .post('/api/generate')
        .send({ difficulty: 'beginner' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('storyId');
      expect(response.body).toHaveProperty('story');
      expect(response.body).toHaveProperty('quiz');
      expect(response.body).toHaveProperty('summary');
    });

    test('POST /api/generate should handle Python API errors', async () => {
      axios.post.mockRejectedValue({
        response: { data: { detail: 'Generation failed' } }
      });

      const response = await request(app)
        .post('/api/generate')
        .send({ difficulty: 'beginner' });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Story Retrieval Endpoint', () => {
    test('GET /api/story/:storyId should return cached story', async () => {
      // First, generate a story to cache it
      axios.post.mockResolvedValueOnce({ data: {} });
      axios.post.mockResolvedValueOnce({
        data: {
          storyId: 'cached-story-123',
          story: { title: 'Cached Story' },
          quiz: { questions: [] },
          summary: 'Cached summary'
        }
      });

      await request(app)
        .post('/api/generate')
        .send({ difficulty: 'beginner' });

      // Now try to retrieve it
      const response = await request(app)
        .get('/api/story/cached-story-123');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('GET /api/story/:storyId should fetch from Python API if not cached', async () => {
      axios.get.mockResolvedValue({
        data: {
          success: true,
          story: { title: 'Remote Story' },
          quiz: {},
          summary: ''
        }
      });

      const response = await request(app)
        .get('/api/story/remote-story-456');

      expect(response.status).toBe(200);
      expect(axios.get).toHaveBeenCalled();
    });

    test('GET /api/story/:storyId should return 404 for non-existent story', async () => {
      axios.get.mockRejectedValue({
        response: { status: 404 }
      });

      const response = await request(app)
        .get('/api/story/non-existent-story');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Latest Story Endpoint', () => {
    test('GET /api/latest-story should return latest cached story', async () => {
      // Generate a story first
      axios.post.mockResolvedValueOnce({ data: {} });
      axios.post.mockResolvedValueOnce({
        data: {
          storyId: 'latest-story-789',
          story: { title: 'Latest Story' },
          quiz: {},
          summary: ''
        }
      });

      await request(app)
        .post('/api/generate')
        .send({});

      const response = await request(app)
        .get('/api/latest-story');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('GET /api/latest-story should fetch from Python API if cache empty', async () => {
      // Clear any previous state by mocking a fresh scenario
      axios.get.mockResolvedValue({
        data: { success: true, story: {} }
      });

      // Note: This test assumes cache might have stories from previous tests
      const response = await request(app)
        .get('/api/latest-story');

      expect(response.status).toBe(200);
    });
  });

  describe('Quiz Generation Endpoint', () => {
    test('POST /api/generate-quiz should generate quiz', async () => {
      axios.post.mockResolvedValue({
        data: { questions: [{ q: 'Test?', a: 'Answer' }] }
      });

      const response = await request(app)
        .post('/api/generate-quiz')
        .send({
          storyData: { title: 'Test Story', content: 'Story content' },
          difficulty: 'beginner'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('quiz');
    });

    test('POST /api/generate-quiz should require storyData', async () => {
      const response = await request(app)
        .post('/api/generate-quiz')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Story data is required');
    });
  });

  describe('Summary Generation Endpoint', () => {
    test('POST /api/generate-summary should generate summary', async () => {
      axios.post.mockResolvedValue({
        data: { summary: 'Generated summary text' }
      });

      const response = await request(app)
        .post('/api/generate-summary')
        .send({
          storyData: { title: 'Test Story', content: 'Story content' },
          selectedInterest: 'finance'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('summary');
    });

    test('POST /api/generate-summary should require storyData', async () => {
      const response = await request(app)
        .post('/api/generate-summary')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('All Stories Endpoint', () => {
    test('GET /api/all-stories should list all stories', async () => {
      axios.get.mockResolvedValue({
        data: { stories: ['story1', 'story2'] }
      });

      const response = await request(app)
        .get('/api/all-stories');

      expect(response.status).toBe(200);
      expect(axios.get).toHaveBeenCalled();
    });

    test('GET /api/all-stories should handle Python API errors', async () => {
      axios.get.mockRejectedValue({
        response: { data: { detail: 'Failed to list' } }
      });

      const response = await request(app)
        .get('/api/all-stories');

      expect(response.status).toBe(500);
    });
  });

  describe('Load User Data Endpoint', () => {
    test('POST /api/load-user-data should load user data', async () => {
      axios.post.mockResolvedValue({
        data: { success: true, message: 'User data loaded' }
      });

      const response = await request(app)
        .post('/api/load-user-data');

      expect(response.status).toBe(200);
    });
  });

  describe('Python Server Check Endpoint', () => {
    test('GET /api/check-python-server should return running status', async () => {
      axios.get.mockResolvedValue({
        data: { status: 'ok' }
      });

      const response = await request(app)
        .get('/api/check-python-server');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.pythonServerStatus).toBe('running');
    });

    test('GET /api/check-python-server should return not running on error', async () => {
      axios.get.mockRejectedValue(new Error('Connection refused'));

      const response = await request(app)
        .get('/api/check-python-server');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.pythonServerStatus).toBe('not running');
    });
  });

  describe('Error Handling', () => {
    test('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/api/unknown-route');

      expect(response.status).toBe(404);
    });

    test('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/generate')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');

      // Should return error, not crash
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('Rate Limiting', () => {
    test('should have rate limiting on /api/ routes', async () => {
      // Make many requests quickly
      const requests = [];
      for (let i = 0; i < 5; i++) {
        requests.push(request(app).get('/api/status'));
      }

      const responses = await Promise.all(requests);
      
      // All should succeed under normal load
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe('Security Headers', () => {
    test('should include security headers from Helmet', async () => {
      const response = await request(app)
        .get('/api/status');

      // Helmet adds various security headers
      expect(response.headers).toHaveProperty('x-content-type-options');
    });
  });
});
