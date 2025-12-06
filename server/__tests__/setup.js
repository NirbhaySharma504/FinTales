/**
 * Jest Test Setup File
 * This file runs before all tests to set up the testing environment
 */

// Set test environment
process.env.NODE_ENV = 'test';
process.env.PORT = 5001;
process.env.MONGO_URI = 'mongodb://localhost:27017/fintales_test';
process.env.PYTHON_API_URL = 'http://localhost:8000';

// Mock console methods to reduce noise during tests (optional)
// Uncomment if you want cleaner test output
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };

// Global test utilities
global.testUtils = {
  // Generate a random MongoDB ObjectId-like string
  generateObjectId: () => {
    const hexChars = '0123456789abcdef';
    let objectId = '';
    for (let i = 0; i < 24; i++) {
      objectId += hexChars[Math.floor(Math.random() * 16)];
    }
    return objectId;
  },

  // Create mock request object
  createMockRequest: (overrides = {}) => ({
    body: {},
    params: {},
    query: {},
    headers: {},
    user: null,
    ...overrides
  }),

  // Create mock response object
  createMockResponse: () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
  },

  // Create mock next function
  createMockNext: () => jest.fn()
};

// Increase timeout for async operations
jest.setTimeout(30000);

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Cleanup after all tests
afterAll(async () => {
  // Close any open handles
  await new Promise(resolve => setTimeout(resolve, 500));
});
