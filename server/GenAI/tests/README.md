# FinTales Backend Testing Guide

This directory contains comprehensive tests for the FinTales FastAPI backend.

## Test Structure

```
tests/
├── unit/              # Unit tests for individual functions/classes
│   ├── test_novel_generator.py
│   ├── test_quiz_generator.py
│   └── test_summarizer.py
├── integration/       # Integration tests for API endpoints
│   └── test_api_endpoints.py
├── module/           # Module-level tests for complete workflows
│   └── test_story_generation_flow.py
├── conftest.py       # Shared fixtures and configuration
└── run_tests.sh      # Test runner script
```

## Running Tests
NOTE: SINCE OUR BACKEND CONTAINS A LOT OF CODE THAT CALLS LLMs LIKE GEMINI, WE ARE HITTING RATE LIMITS WHILE TESTING.
SO TO TEST, A MOCK API HAS BEEN USED IN THESE TESTS TO SIMULATE THE RESPONSES.




### Run All Tests
```bash
pytest
```

### Run Specific Test Categories
```bash
# Unit tests only
pytest tests/unit -m unit

# Integration tests only
pytest tests/integration -m integration

# Module tests only
pytest tests/module -m module
```

### Run with Coverage
```bash
pytest --cov=. --cov-report=html
```

### Run Specific Test File
```bash
pytest tests/unit/test_novel_generator.py
```

### Run Specific Test Function
```bash
pytest tests/unit/test_novel_generator.py::TestFinancialNovelGenerator::test_init
```

### Using the Test Runner Script
```bash
chmod +x tests/run_tests.sh
./tests/run_tests.sh
```

## Test Markers

Tests are categorized using pytest markers:

- `@pytest.mark.unit` - Unit tests
- `@pytest.mark.integration` - Integration tests
- `@pytest.mark.module` - Module tests
- `@pytest.mark.slow` - Slow-running tests
- `@pytest.mark.api` - Tests that make API calls
- `@pytest.mark.mock` - Tests using mocks

Run tests by marker:
```bash
pytest -m unit
pytest -m "not slow"
```

## Test Fixtures

Common fixtures are defined in `conftest.py`:

- `client` - FastAPI test client
- `mock_gemini_client` - Mocked Gemini API client
- `sample_story_data` - Sample story data
- `sample_quiz_data` - Sample quiz data
- `sample_summary_data` - Sample summary data
- `sample_user_data` - Sample user data
- `mock_cloudinary` - Mocked Cloudinary uploader
- `temp_interests_file` - Temporary interests.json file
- `reset_cache` - Resets caches before/after tests

## Writing New Tests

### Unit Test Example
```python
@pytest.mark.unit
def test_my_function():
    result = my_function(input_data)
    assert result == expected_output
```

### Integration Test Example
```python
@pytest.mark.integration
def test_api_endpoint(client):
    response = client.post("/api/endpoint", json={"data": "test"})
    assert response.status_code == 200
```

### Using Fixtures
```python
def test_with_fixture(sample_story_data):
    result = process_story(sample_story_data)
    assert result is not None
```

## Coverage Goals

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: All endpoints covered
- **Module Tests**: All workflows covered

View coverage report:
```bash
pytest --cov=. --cov-report=html
open htmlcov/index.html
```

## Continuous Integration

Tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run tests
  run: |
    pip install -r requirements.txt
    pytest --cov=. --cov-report=xml
```

## Notes

- All API calls are mocked by default to avoid rate limits
- Use `@pytest.mark.skip` for tests requiring real API keys
- Environment variables are set in `conftest.py` for testing
- Caches are automatically reset between tests

