# FinTales Frontend - Testing Report

## Project Overview

FinTales is a React-based web application for managing NFTs and user preferences. This report covers the frontend testing implementation, setup instructions, and evaluation guidelines for the testing suite located in the GitHub repository.

## Table of Contents

1. Technology Stack
2. Project Structure
3. Setup Instructions
4. Running the Application
5. Testing Implementation
6. Test Execution
7. Test Coverage
8. Known Issues & Solutions
9. Evaluation Instructions

---

## Technology Stack

### Core Dependencies
- **React 18.3.1** - UI library
- **React Router DOM 5.3.4** - Client-side routing
- **Web3 1.5.0** - Blockchain integration
- **Firebase** - Authentication and backend services

### Testing Dependencies
- **Vitest 4.0.15** - Testing framework
- **@testing-library/react 14.0.0** - React component testing utilities
- **@testing-library/jest-dom 6.0.0** - Custom jest matchers
- **happy-dom** - Lightweight DOM implementation for testing
- **@vitejs/plugin-react 4.2.0** - React support for Vite
- **Vite 4.5.0** - Build tool and dev server

---

## Project Structure

The complete testing setup is located in the GitHub repository under:

```
FinTales/
└── client/
    └── src/
        └── testing/
            ├── package.json              # Testing dependencies
            ├── package-lock.json         # Dependency lock file
            ├── vitest.config.js          # Vitest configuration
            ├── tsconfig.json             # TypeScript configuration
            ├── tailwind.config.ts        # Tailwind CSS configuration
            ├── vite.config.js            # Vite configuration
            ├── readme.md                 # Testing documentation
            ├── scripts/                  # Build and deployment scripts
            │   ├── build.sh
            │   ├── deploy.sh
            │   └── setup.sh
            ├── src/                      # Source code (mirrored for testing)
            │   ├── App.jsx
            │   ├── App.css
            │   ├── index.css
            │   ├── main.jsx
            │   ├── components/           # All React components
            │   │   ├── auth/
            │   │   ├── home/
            │   │   ├── layout/
            │   │   ├── nfts/
            │   │   ├── preferences/
            │   │   └── ui/
            │   ├── contexts/             # React contexts
            │   ├── services/             # API services
            │   ├── styles/               # Global styles
            │   └── utils/                # Utility functions
            └── tests/                    # Test files
                ├── setup.js              # Global test setup
                ├── unit/                 # Unit tests
                │   └── components.test.jsx
                └── integration/          # Integration tests
                    └── app.test.jsx
```

**GitHub Repository Path**: `FinTales/client/src/testing/`

---

## Setup Instructions

### Prerequisites
- **Node.js** (v14 or higher)
- **npm** (v6 or higher)
- **Git** (for cloning the repository)

### Clone and Setup

1. **Clone the repository**:
   ```bash
   git clone <your-github-repo-url>
   cd FinTales
   ```

2. **Navigate to the testing directory**:
   ```bash
   cd client/src/testing
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Verify installation**:
   ```bash
   npm list
   ```

### Configuration Files

All configuration files are included in the repository at `client/src/testing/`:

#### **vitest.config.js** (Already in repo)
```javascript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react({
    jsxRuntime: 'classic',
  })],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './tests/setup.js',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

#### **setup.js** (Already in repo)
```javascript
import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
})

global.expect = expect
```

#### **package.json** (Already in repo)
Contains all necessary scripts and dependencies for testing.

---

## Running the Application

### Development Mode

From the `client/src/testing` directory:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port specified by Vite).

### Production Build

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

---

## Testing Implementation

### Testing Strategy

The testing suite in `client/src/testing/tests/` implements a comprehensive strategy:

1. **Unit Tests** - Individual component rendering and functionality
2. **Integration Tests** - Application-level component interaction

### Test Files Structure

```
client/src/testing/tests/
├── setup.js                      # Global test configuration
├── unit/
│   └── components.test.jsx       # Component unit tests (12 tests)
└── integration/
    └── app.test.jsx              # Application integration tests (2 tests)
```

### Unit Tests (components.test.jsx)

Located at: `client/src/testing/tests/unit/components.test.jsx`

Tests all major components individually:

**Authentication Components**:
- InterestForm
- Login
- LogoutButton
- PreferencesForm
- Register

**Layout Components**:
- Layout
- Navbar
- Footer

**Feature Components**:
- Home
- AchievementsPage
- NFTCard
- PreferencesPage

**Example Test Pattern**:
```javascript
describe('Component Tests', () => {
    test('renders Login component', () => {
        render(<Login />);
        expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    });

    test('renders NFTCard component', () => {
        const mockNFT = {
            image: 'test.jpg',
            title: 'Test NFT',
            description: 'Test Description'
        };
        render(<NFTCard nft={mockNFT} />);
        expect(screen.getByText(/test nft/i)).toBeInTheDocument();
    });
});
```

### Integration Tests (app.test.jsx)

Located at: `client/src/testing/tests/integration/app.test.jsx`

Tests the complete application flow:
- Main layout rendering
- Default route behavior
- Component integration

**Example Test**:
```javascript
describe('App Component', () => {
  test('renders the main layout', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  test('renders home page by default', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(screen.getByText(/welcome to fintales/i)).toBeInTheDocument();
  });
});
```

### Mocking Strategy

All mocks are configured in the test files:

**Firebase Services**:
```javascript
vi.mock('firebase/app', () => ({ initializeApp: vi.fn(() => ({})) }))
vi.mock('firebase/auth', () => ({ getAuth: vi.fn(() => ({})) }))
vi.mock('firebase/firestore', () => ({ getFirestore: vi.fn(() => ({})) }))
vi.mock('firebase/storage', () => ({ getStorage: vi.fn(() => ({})) }))
```

**AuthContext**:
```javascript
vi.mock('../../src/contexts/AuthContext', () => {
    const React = require('react');
    const mockContext = React.createContext({
        user: null,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
    });
    return {
        AuthContext: mockContext,
        AuthProvider: ({ children }) => React.createElement(mockContext.Provider, { 
            value: {
                user: null,
                login: vi.fn(),
                logout: vi.fn(),
                register: vi.fn(),
            }
        }, children),
    };
});
```

---

## Test Execution

### Running Tests from GitHub Repository

After cloning the repository, navigate to the testing directory:

```bash
cd FinTales/client/src/testing
```

### Run All Tests

```bash
npm test
```

**Expected Output**:
```
✓ tests/integration/app.test.jsx (2 tests) 43ms
✓ tests/unit/components.test.jsx (12 tests) 75ms

Test Files: 2 passed (2)
Tests: 14 passed (14)
Duration: ~2s
```

### Test Options

```bash
# Run tests in watch mode
npm test -- --watch

# Run with coverage report
npm test -- --coverage

# Run only unit tests
npm test tests/unit/components.test.jsx

# Run only integration tests
npm test tests/integration/app.test.jsx

# Clear test cache
npx vitest --clearCache
npm test

# Run with UI interface
npm test -- --ui

# Run with verbose output
npm test -- --reporter=verbose
```

### Filter Tests During Execution

While tests are running in watch mode, press:
- `f` - Filter to only failed tests
- `t` - Filter by test name pattern
- `p` - Filter by file name pattern
- `a` - Re-run all tests
- `q` - Quit

---

## Test Coverage

### Current Test Results

```
Test Files: 2 passed (2)
  - Unit Tests: 1 file (12 tests)
  - Integration Tests: 1 file (2 tests)
Total Tests: 14 passed
Duration: ~2 seconds
Status: ✅ All Passing
```

### Component Coverage Table

| Component | Type | File Path | Status |
|-----------|------|-----------|--------|
| InterestForm | Unit | InterestForm.jsx | ✅ Passing |
| Login | Unit | Login.jsx | ✅ Passing |
| LogoutButton | Unit | LogoutButton.jsx | ✅ Passing |
| PreferencesForm | Unit | PreferencesForm.jsx | ✅ Passing |
| Register | Unit | Register.jsx | ✅ Passing |
| Home | Unit | Home.jsx | ✅ Passing |
| Footer | Unit | Footer.jsx | ✅ Passing |
| Layout | Unit | Layout.jsx | ✅ Passing |
| Navbar | Unit | Navbar.jsx | ✅ Passing |
| AchievementsPage | Unit | AchievementsPage.jsx | ✅ Passing |
| NFTCard | Unit | NFTCard.jsx | ✅ Passing |
| PreferencesPage | Unit | PreferencesPage.jsx | ✅ Passing |
| App Layout | Integration | App.jsx | ✅ Passing |
| App Routing | Integration | App.jsx | ✅ Passing |

### Coverage Metrics

To generate a detailed coverage report:

```bash
npm test -- --coverage
```

This will create a coverage report in `client/src/testing/coverage/` directory.

View the HTML report:
```bash
# Windows
start coverage/index.html

# Mac/Linux
open coverage/index.html
```

---

## Known Issues & Solutions

### Issue 1: Missing CSS/SCSS Files

**Problem**: Components import CSS/SCSS files that were created as placeholders.

**Status**: ✅ Resolved - All required CSS/SCSS files are included in the repository:
- Footer.scss
- Register.scss
- NFTCard.css
- preferences.scss
- UpdatePreferences.scss

**If you encounter missing files locally**:
```bash
cd client/src/testing
# Files should exist in repo, but if needed:
touch src/components/layout/Footer.scss
touch src/components/auth/Register.scss
touch src/components/nfts/NFTCard.css
touch src/components/preferences/preferences.scss
touch src/components/home/UpdatePreferences.scss
```

### Issue 2: React Version Compatibility

**Problem**: Older @testing-library/react versions don't support React 18.

**Solution**: ✅ Already configured in package.json:
```json
{
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0"
  }
}
```

### Issue 3: Vite/Vitest Version Compatibility

**Problem**: Version mismatches between Vite and Vitest.

**Solution**: ✅ Already configured in package.json:
```json
{
  "devDependencies": {
    "vite": "^4.5.0",
    "@vitejs/plugin-react": "^4.2.0",
    "vitest": "^4.0.15"
  }
}
```

### Issue 4: Path Resolution Issues

**Problem**: Import paths not resolving correctly.

**Solution**: ✅ Configured in vitest.config.js:
```javascript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

### Issue 5: Node Modules Issues

**Problem**: Dependency conflicts or corrupted modules.

**Solution**:
```bash
cd client/src/testing

# Remove node_modules and lock file
rm -rf node_modules package-lock.json

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
npm install
```

### Issue 6: Port Already in Use

**Problem**: Cannot start dev server because port is in use.

**Solution**:
```bash
# Windows (PowerShell)
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5173
kill -9 <PID>

# Or specify a different port
npm run dev -- --port 3000
```

---

## Evaluation Instructions

### Quick Start for Evaluators

#### Step 1: Clone the Repository

```bash
git clone <your-github-repo-url>
cd FinTales
```

#### Step 2: Navigate to Testing Directory

```bash
cd client/src/testing
```

#### Step 3: Install Dependencies

```bash
npm install
```

**Expected**: No errors, all dependencies installed successfully.

#### Step 4: Run Tests

```bash
npm test
```

**Expected Output**:
```
✓ tests/integration/app.test.jsx (2 tests)
✓ tests/unit/components.test.jsx (12 tests)

Test Files: 2 passed (2)
Tests: 14 passed (14)
```

#### Step 5: Run Application

```bash
npm run dev
```

**Expected**: Application starts at `http://localhost:5173`

### Detailed Verification Steps

#### Verify Test Structure

```bash
cd client/src/testing

# List test files
ls tests/
ls tests/unit/
ls tests/integration/
```

**Expected**:
```
tests/
  setup.js
  unit/
    components.test.jsx
  integration/
    app.test.jsx
```

#### Verify Source Files

```bash
ls src/components/
```

**Expected**: All component folders (auth, home, layout, nfts, preferences, ui)

#### Run Individual Test Suites

```bash
# Unit tests only
npm test tests/unit/components.test.jsx

# Integration tests only
npm test tests/integration/app.test.jsx
```

**Expected**: Both test suites pass independently.

#### Generate Coverage Report

```bash
npm test -- --coverage
```

**Expected**: Coverage report generated in `coverage/` directory.

#### Verify Configuration Files

```bash
# Check if all config files exist
ls -la | grep -E "(vitest|package|tsconfig|tailwind)"
```

**Expected Files**:
- vitest.config.js ✓
- package.json ✓
- package-lock.json ✓
- tsconfig.json ✓
- tailwind.config.ts ✓

### Evaluation Checklist

- [ ] Repository cloned successfully
- [ ] Dependencies installed without errors (`npm install`)
- [ ] All 14 tests pass (`npm test`)
- [ ] No console errors during test execution
- [ ] Application runs successfully (`npm run dev`)
- [ ] All configuration files present
- [ ] Test files are in correct structure
- [ ] Coverage report generates successfully

### Common Evaluation Issues

#### Issue: "Cannot find module" errors

**Solution**:
```bash
cd client/src/testing
npm install
```

#### Issue: Tests fail after fresh clone

**Solution**:
```bash
# Clear any cached data
npx vitest --clearCache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Run tests
npm test
```

#### Issue: Application doesn't start

**Solution**:
```bash
# Check if port 5173 is available
# Or use a different port
npm run dev -- --port 3000
```

### Troubleshooting Commands

```bash
# Check Node version (should be v14+)
node --version

# Check npm version
npm --version

# Verify all dependencies are installed
npm list --depth=0

# Clear all caches
npm cache clean --force
npx vitest --clearCache

# Fresh install
rm -rf node_modules package-lock.json
npm install
```

---

## Testing Best Practices Implemented

### 1. Isolation
- Each test runs independently
- Automatic cleanup after each test
- No shared state between tests

### 2. Mocking
- External dependencies (Firebase, Auth) properly mocked
- No real API calls during tests
- Consistent mock data across tests

### 3. Accessibility
- Using `getByRole` for better accessibility testing
- Testing user-visible behavior
- Semantic HTML validation

### 4. Specificity
- Specific queries to avoid false positives
- Testing exact behavior, not implementation details
- Clear test descriptions

### 5. Maintainability
- Well-organized test structure
- Reusable test utilities
- Clear naming conventions

---

## CI/CD Integration

### GitHub Actions Workflow

Create `.github/workflows/test.yml`:

```yaml
name: Frontend Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    defaults:
      run:
        working-directory: client/src/testing
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: client/src/testing/package-lock.json
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test -- --run
      
      - name: Generate coverage
        run: npm test -- --coverage
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          files: ./client/src/testing/coverage/coverage-final.json
          flags: frontend
```

---

## Scripts Documentation

Located at `client/src/testing/scripts/`:

### `build.sh`
Builds the application for production.

```bash
chmod +x scripts/build.sh
./scripts/build.sh
```

### `deploy.sh`
Deployment script for production environment.

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### `setup.sh`
Initial setup script for development environment.

```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

---

## Future Improvements

### Testing Enhancements
1. Add E2E tests with Playwright or Cypress
2. Increase coverage for user interactions (click events, form submissions)
3. Add visual regression testing with Percy or Chromatic
4. Implement performance benchmarks
5. Add snapshot testing for complex components

### Development Workflow
1. Implement pre-commit hooks with Husky
2. Add automated dependency updates with Dependabot
3. Set up automated code quality checks
4. Implement automated deployment on test success

---

## Documentation & Resources

### Official Documentation
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Vite Documentation](https://vitejs.dev/)

### Testing Best Practices
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [React Testing Patterns](https://kentcdodds.com/blog/fix-the-not-wrapped-in-act-warning)

### Related Documentation
- Repository README: `client/src/testing/readme.md`
- Main project documentation: Check repository root


---

## Appendix

### A. Complete Command Reference

```bash
# Setup
cd FinTales/client/src/testing
npm install

# Testing
npm test                          # Run all tests
npm test -- --watch              # Watch mode
npm test -- --coverage           # With coverage
npm test -- --ui                 # UI mode
npm test tests/unit/             # Unit tests only
npm test tests/integration/      # Integration tests only
npx vitest --clearCache          # Clear cache

# Development
npm run dev                      # Start dev server
npm run build                    # Production build
npm run preview                  # Preview production build

# Scripts
chmod +x scripts/*.sh            # Make scripts executable
./scripts/setup.sh              # Run setup
./scripts/build.sh              # Run build
./scripts/deploy.sh             # Run deployment
```

### B. File Structure Quick Reference

```
client/src/testing/
├── Configuration Files
│   ├── package.json
│   ├── vitest.config.js
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── vite.config.js
│
├── Source Code (src/)
│   ├── App.jsx
│   ├── components/
│   ├── contexts/
│   ├── services/
│   ├── styles/
│   └── utils/
│
├── Tests (tests/)
│   ├── setup.js
│   ├── unit/
│   │   └── components.test.jsx
│   └── integration/
│       └── app.test.jsx
│
└── Scripts (scripts/)
    ├── build.sh
    ├── deploy.sh
    └── setup.sh
```

### C. Environment Variables

If needed, create `.env` in `client/src/testing/`:

```env
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id
```

### D. Coverage Report Location

After running `npm test -- --coverage`:

```
client/src/testing/coverage/
├── index.html              # Main coverage report
├── coverage-final.json     # JSON coverage data
└── lcov-report/           # Detailed LCOV report
```

View reports:
```bash
# Windows
start coverage/index.html

# Mac
open coverage/index.html

# Linux
xdg-open coverage/index.html
```

---

**Report Generated**: December 7, 2025  
**Version**: 1.0  
**Repository Path**: `FinTales/client/src/testing/`  
**Test Framework**: Vitest 4.0.15  
**Total Tests**: 14 (12 unit + 2 integration)  
**Status**: ✅ All Passing  
**Test Files**: 2  
**Coverage**: Available via `npm test -- --coverage`
