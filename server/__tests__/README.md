# FinTales Backend Testing Documentation

## Overview

This document describes the comprehensive testing suite for the FinTales backend JavaScript application. The tests are organized into four levels following software engineering best practices:

1. **Unit Tests** - Test individual functions and utilities in isolation
2. **Module Tests** - Test modules/components with their dependencies mocked
3. **Integration Tests** - Test how components work together
4. **System Tests** - Test the complete system end-to-end

## Test Structure

```
__tests__/
├── setup.js                          # Global test setup and utilities
├── unit/                             # Unit Tests
│   ├── utils/
│   │   ├── errorHandler.test.js      # Error handler utility tests
│   │   ├── apiResponse.test.js       # API response utility tests
│   │   ├── nftData.test.js           # NFT data validation tests
│   │   └── saveUserProfile.test.js   # User profile saving tests
│   └── models/
│       ├── userModel.test.js         # User model schema tests
│       └── nftModel.test.js          # NFT model schema tests
├── module/                           # Module Tests
│   ├── middleware/
│   │   ├── authMiddleware.test.js    # Authentication middleware tests
│   │   └── errorMiddleware.test.js   # Error handling middleware tests
│   └── controllers/
│       ├── authController.test.js    # Auth controller tests
│       └── nftController.test.js     # NFT controller tests
├── integration/                      # Integration Tests
│   └── routes/
│       ├── authRoutes.test.js        # Auth routes integration tests
│       └── nftRoutes.test.js         # NFT routes integration tests
└── system/                           # System Tests
    ├── api.test.js                   # Complete API system tests
    ├── database.test.js              # Database configuration tests
    └── authFlow.test.js              # Authentication flow tests
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Levels
```bash
# Unit tests only
npm run test:unit

# Module tests only
npm run test:module

# Integration tests only
npm run test:integration

# System tests only
npm run test:system
```

### Run with Coverage
```bash
npm run test:coverage
```

### Watch Mode (development)
```bash
npm run test:watch
```

## Test Coverage

The test suite covers the following components:

### Unit Tests
- **Utils**
  - `errorHandler.js` - successResponse, errorResponse, formatValidationErrors
  - `apiResponse.js` - AppError class, asyncHandler, handleMongooseError
  - `nftData.js` - NFT data structure and validation
  - `saveUserProfile.js` - File I/O operations for user profiles

- **Models**
  - `userModel.js` - Schema validation, defaults, virtuals
  - `nftModel.js` - Schema validation, indexes, timestamps

### Module Tests
- **Middleware**
  - `authMiddleware.js` - protect, admin middleware functions
  - `errorMiddleware.js` - notFound, errorHandler middleware

- **Controllers**
  - `authController.js` - authenticateUser, getCurrentUser, updatePreferences, etc.
  - `nftController.js` - getUserNFTData, saveWalletAddress, mintNFT, getAllNFTs

### Integration Tests
- **Routes**
  - `authRoutes.js` - Full route testing with Express
  - `nftRoutes.js` - Full route testing with Express

### System Tests
- **API Tests** - Complete application testing
- **Database Tests** - Database connection and configuration
- **Auth Flow Tests** - End-to-end authentication scenarios

## Test Utilities

The test setup provides global utilities accessible via `global.testUtils`:

```javascript
// Generate mock MongoDB ObjectId
testUtils.generateObjectId()

// Create mock Express request object
testUtils.createMockRequest({ body: {}, user: {} })

// Create mock Express response object
testUtils.createMockResponse()

// Create mock next function
testUtils.createMockNext()
```

## Mocking Strategy

### External Dependencies Mocked:
- Firebase Admin SDK (`firebase-admin`)
- MongoDB/Mongoose connections
- Axios (for Python API calls)
- File system operations

### Internal Dependencies:
- User and NFT models are mocked in integration and system tests
- Controllers use mocked services
- Middleware uses mocked authentication

## Coverage Thresholds

The test suite enforces minimum coverage thresholds:
- Branches: 50%
- Functions: 50%
- Lines: 50%
- Statements: 50%

## Writing New Tests

### Unit Test Template
```javascript
describe('Module Name - Unit Tests', () => {
  describe('Function Name', () => {
    test('should do something specific', () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = functionUnderTest(input);
      
      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

### Integration Test Template
```javascript
describe('Route - Integration Tests', () => {
  let app;
  
  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/route', routeUnderTest);
  });

  test('POST /api/route should return success', async () => {
    const response = await request(app)
      .post('/api/route')
      .send({ data: 'test' });
    
    expect(response.status).toBe(200);
  });
});
```

## CI/CD Integration

These tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v2
    - uses: actions/setup-node@v2
    - run: npm ci
    - run: npm run test:coverage
```

## Troubleshooting

### Common Issues

1. **Tests timing out**: Increase timeout in `jest.config.js` or individual tests
2. **Mock not working**: Ensure mocks are defined before requiring modules
3. **Async issues**: Use `async/await` or return promises from tests

### Debug Mode
```bash
# Run tests with verbose output
npm test -- --verbose

# Run single test file
npm test -- __tests__/unit/utils/errorHandler.test.js
```
