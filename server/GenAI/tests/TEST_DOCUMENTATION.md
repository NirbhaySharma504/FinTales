# Test Documentation

## Overview

This document provides a comprehensive overview of all test cases in the FinTales GenAI test suite. The tests are organized into three main categories: **Unit Tests**, **Module Tests**, and **Integration Tests**.

**Test Statistics:**
- **Total Tests**: 47 passing, 1 skipped (unit + module)
- **Unit Tests**: 44 tests (all passing)
- **Module Tests**: 3 tests (all passing)
- **Integration Tests**: 16 tests (15 passing, 1 failing - run separately)

---

## Test Structure

```
tests/
├── conftest.py                    # Shared fixtures and configuration
├── unit/                          # Unit tests for individual modules
│   ├── test_novel_generator.py   # 15 tests
│   ├── test_quiz_generator.py     # 13 tests
│   └── test_summarizer.py        # 16 tests
├── module/                        # Module-level integration tests
│   └── test_story_generation_flow.py  # 3 tests
└── integration/                   # API endpoint integration tests
    └── test_api_endpoints.py     # 15 tests (not actively run)
```

---

## Test Categories

### 1. Unit Tests (`tests/unit/`)

Unit tests verify individual components in isolation using mocked dependencies.

#### Key Characteristics:
- **Mocked APIs**: All external API calls are mocked to avoid quota consumption
- **Isolated Testing**: Each module is tested independently
- **Fast Execution**: No real network calls, runs in milliseconds
- **Comprehensive Coverage**: Tests initialization, validation, parsing, generation, and error handling

---

## Detailed Test Cases

### A. NovelGenerator Tests (`test_novel_generator.py`)

**Total: 15 tests**

#### Class: `TestFinancialNovelGenerator`

##### Initialization Tests
1. **`test_init`**
   - **Purpose**: Verifies generator initializes correctly
   - **Checks**: Generator object creation, GameState initialization
   - **Mocks**: Gemini client, Cloudinary config, file system

2. **`test_load_user_data_success`**
   - **Purpose**: Tests successful loading of user preferences from JSON file
   - **Checks**: Selected interest is properly extracted and set
   - **Validates**: Interest category and name are present

3. **`test_load_user_data_file_not_found`**
   - **Purpose**: Tests graceful handling when user data file is missing
   - **Checks**: Falls back to default interest (Spider-Man)
   - **Validates**: System doesn't crash, uses sensible defaults

4. **`test_load_user_data_invalid_json`**
   - **Purpose**: Tests handling of corrupted/invalid JSON files
   - **Checks**: Graceful fallback to defaults
   - **Validates**: Error logging and default interest selection

##### Interest Selection Tests
5. **`test_select_random_interest`**
   - **Purpose**: Tests random selection from available interests
   - **Checks**: Returns valid category and interest from provided list
   - **Validates**: Selection is from correct category

6. **`test_select_random_interest_empty`**
   - **Purpose**: Tests behavior with empty interest list
   - **Checks**: Returns default interest (Comics & Anime, Spider-Man)
   - **Validates**: System has sensible fallback

##### Utility Tests
7. **`test_create_asset_directories`**
   - **Purpose**: Tests directory creation for output files
   - **Checks**: `os.makedirs` is called for required directories
   - **Validates**: Directory structure setup

8. **`test_determine_age_group_from_difficulty`**
   - **Purpose**: Tests age group mapping from difficulty levels
   - **Checks**: beginner → 10-12, intermediate → 12-14, advanced → 14-16
   - **Note**: Logic is actually in QuizGenerator, but concept is tested

##### Story Generation Tests
9. **`test_generate_story_segment_success`**
   - **Purpose**: Tests successful story generation with mocked API
   - **Checks**: Returns valid StoryData object with correct title
   - **Mocks**: Gemini API response with sample story data
   - **Validates**: Story structure, title matching, Pydantic validation

10. **`test_generate_story_segment_api_error`**
    - **Purpose**: Tests error handling when API fails
    - **Checks**: Returns error story structure instead of crashing
    - **Mocks**: API exception (rate limit error)
    - **Validates**: Error story has "Error" in title, system remains stable

##### JSON Parsing Tests
11. **`test_parse_response_valid_json`**
    - **Purpose**: Tests parsing of valid JSON responses
    - **Checks**: Correctly extracts story data from JSON
    - **Validates**: Title and structure are preserved

12. **`test_parse_response_markdown_wrapped`**
    - **Purpose**: Tests parsing JSON wrapped in markdown code blocks
    - **Checks**: Handles ```json ... ``` format
    - **Validates**: Extracts JSON from markdown correctly

13. **`test_parse_response_invalid_json`**
    - **Purpose**: Tests handling of malformed JSON
    - **Checks**: Returns error story structure
    - **Validates**: "Parsing Error" in title, graceful degradation

#### Class: `TestPydanticModels`

##### Model Validation Tests
14. **`test_character_model`**
    - **Purpose**: Tests Character Pydantic model validation
    - **Checks**: Name and description fields work correctly

15. **`test_plot_model`**
    - **Purpose**: Tests Plot model validation
    - **Checks**: Title, setup, and locations are properly validated

16. **`test_story_data_model`**
    - **Purpose**: Tests complete StoryData model
    - **Checks**: All nested models (plot, dialogue, visuals) validate correctly
    - **Validates**: Story structure integrity

---

### B. QuizGenerator Tests (`test_quiz_generator.py`)

**Total: 13 tests**

#### Class: `TestQuizGenerator`

##### Initialization Tests
1. **`test_init`**
   - **Purpose**: Verifies quiz generator initializes correctly
   - **Checks**: Generator and client objects are created

2. **`test_init_missing_api_key`**
   - **Purpose**: Tests error when API key is missing
   - **Checks**: Raises ValueError with appropriate message
   - **Validates**: Environment variable validation

##### Utility Tests
3. **`test_determine_age_group`**
   - **Purpose**: Tests age group determination from difficulty
   - **Checks**: 
     - beginner → "10-12"
     - intermediate → "12-14"
     - advanced → "14-16"
     - unknown → "10-12" (default)

4. **`test_validate_inputs_valid`**
   - **Purpose**: Tests input validation with valid story data
   - **Checks**: No exceptions raised for valid inputs

5. **`test_validate_inputs_empty_story_data`**
   - **Purpose**: Tests validation rejects empty story data
   - **Checks**: Raises ValueError with "cannot be empty" message

6. **`test_validate_inputs_missing_keys`**
   - **Purpose**: Tests validation rejects incomplete data
   - **Checks**: Raises ValueError for missing required keys (plot, dialogue, visuals)

##### JSON Parsing Tests
7. **`test_parse_json_response_valid`**
   - **Purpose**: Tests parsing valid JSON quiz responses
   - **Checks**: Topic and questions are correctly extracted

8. **`test_parse_json_response_markdown`**
   - **Purpose**: Tests parsing JSON wrapped in markdown
   - **Checks**: Handles markdown code block format

9. **`test_parse_json_response_empty`**
   - **Purpose**: Tests handling of empty API responses
   - **Checks**: Raises ValueError with "Empty response" message

##### Quiz Generation Tests
10. **`test_generate_quiz_success`**
    - **Purpose**: Tests successful quiz generation
    - **Mocks**: Gemini API with sample quiz data
    - **Checks**: Returns Quiz object with correct topic and questions
    - **Validates**: Pydantic model validation, question count

11. **`test_generate_quiz_api_error`**
    - **Purpose**: Tests error handling when API fails
    - **Mocks**: API exception (rate limit)
    - **Checks**: Returns default quiz instead of crashing
    - **Validates**: Default quiz has topic "Financial Literacy"

12. **`test_get_default_quiz`**
    - **Purpose**: Tests default quiz structure
    - **Checks**: Default quiz has correct topic, difficulty, age_group
    - **Validates**: Contains at least one question

#### Class: `TestQuizModels`

##### Model Validation Tests
13. **`test_quiz_option`**
    - **Purpose**: Tests QuizOption model
    - **Checks**: Text and is_correct fields

14. **`test_quiz_question`**
    - **Purpose**: Tests QuizQuestion model
    - **Checks**: Question text, options array, explanation

15. **`test_quiz_model`**
    - **Purpose**: Tests complete Quiz model
    - **Checks**: Topic, difficulty, age_group, questions array

---

### C. Summarizer Tests (`test_summarizer.py`)

**Total: 16 tests**

#### Class: `TestSummarize`

##### Initialization Tests
1. **`test_init`**
   - **Purpose**: Verifies summarizer initializes correctly
   - **Checks**: Summarizer and client objects are created

2. **`test_init_missing_api_key`**
   - **Purpose**: Tests error when API key is missing
   - **Checks**: Raises ValueError with appropriate message

##### Validation Tests
3. **`test_validate_story_data_valid`**
   - **Purpose**: Tests validation accepts valid story data
   - **Checks**: No exceptions for complete story structure

4. **`test_validate_story_data_missing_fields`**
   - **Purpose**: Tests validation rejects incomplete data
   - **Checks**: Raises ValueError for missing required fields (plot, dialogue, visuals)

5. **`test_validate_story_data_missing_title`**
   - **Purpose**: Tests validation requires title in plot
   - **Checks**: Raises ValueError when title is missing

##### JSON Parsing Tests
6. **`test_parse_json_response_valid`**
   - **Purpose**: Tests parsing valid JSON summary responses
   - **Checks**: Topic and learning_summary are correctly extracted

7. **`test_parse_json_response_markdown`**
   - **Purpose**: Tests parsing JSON wrapped in markdown
   - **Checks**: Handles markdown code block format

8. **`test_parse_json_response_empty`**
   - **Purpose**: Tests handling of empty API responses
   - **Checks**: Raises ValueError with "Empty response" message

##### Summary Generation Tests
9. **`test_generate_summary_success`**
    - **Purpose**: Tests successful summary generation
    - **Mocks**: Gemini API with sample summary data
    - **Checks**: Returns summary with correct topic and key_points
    - **Validates**: Learning summary structure

10. **`test_generate_summary_api_error`**
    - **Purpose**: Tests error handling when API fails
    - **Mocks**: API exception (rate limit)
    - **Checks**: Returns fallback summary instead of crashing
    - **Validates**: Fallback has topic and learning_summary

11. **`test_generate_summary_invalid_data`**
    - **Purpose**: Tests handling of invalid input data
    - **Checks**: Returns fallback summary for invalid inputs
    - **Validates**: Graceful degradation, no crashes

12. **`test_generate_summary_without_interest`**
    - **Purpose**: Tests summary generation without selected interest
    - **Mocks**: API response
    - **Checks**: Works correctly with None interest parameter
    - **Validates**: Summary still generated successfully

#### Class: `TestSummarizerModel`

##### Model Validation Tests
13. **`test_summarizer_model`**
    - **Purpose**: Tests Summarizer Pydantic model validation
    - **Checks**: Topic and learning_summary structure
    - **Validates**: Key points are present

---

### D. Module Tests (`test_story_generation_flow.py`)

**Total: 3 tests**

These tests verify integration between multiple modules working together.

#### Class: `TestStoryGenerationFlow`

1. **`test_complete_story_generation_flow`**
   - **Purpose**: Tests complete end-to-end workflow
   - **Flow**: Story generation → Quiz generation → Summary generation
   - **Mocks**: All three generators (story, quiz, summary)
   - **Checks**: 
     - API endpoint returns 200
     - Story, quiz, and summary are all present in response
     - Data is cached correctly (story_cache, quiz_cache, summary_cache)
   - **Validates**: Complete integration of all components

#### Class: `TestModuleIntegration`

2. **`test_novel_generator_to_quiz_generator`**
   - **Purpose**: Tests data flow from story to quiz
   - **Checks**: Quiz generator can process story data
   - **Validates**: Quiz is created from story data correctly

3. **`test_novel_generator_to_summarizer`**
   - **Purpose**: Tests data flow from story to summary
   - **Checks**: Summarizer can process story data
   - **Validates**: Summary is created from story data correctly

#### Class: `TestEndToEndWorkflow`

4. **`test_real_api_call_workflow`** (SKIPPED)
   - **Purpose**: Would test with real API calls
   - **Status**: Intentionally skipped to avoid quota consumption
   - **Note**: Can be enabled for manual testing with real API keys

---

### E. Integration Tests (`test_api_endpoints.py`)

**Total: 16 tests** (Run separately, not in standard `pytest tests/` suite)

These tests verify FastAPI endpoint functionality. They are marked with `@pytest.mark.integration` and can be run separately using:
```bash
pytest tests/integration/ -v
# or
pytest tests/ -m integration -v
```

**Why run separately?**
- They test the full API stack (slower execution)
- They may have some failures that need fixing
- They can be run independently for focused API testing
- The standard test suite focuses on fast unit/module tests

#### Class: `TestAPIEndpoints`

##### Basic Endpoint Tests
1. **`test_root_endpoint`**
   - **Purpose**: Tests root API endpoint
   - **Checks**: Returns 200 with API message

2. **`test_load_user_data_endpoint`**
   - **Purpose**: Tests user data loading endpoint
   - **Checks**: Returns success response

##### Generation Endpoint Tests
3. **`test_generate_endpoint_success`**
   - **Purpose**: Tests complete story generation endpoint
   - **Mocks**: All generators
   - **Checks**: Returns story, quiz, summary, and storyId

4. **`test_generate_endpoint_invalid_difficulty`**
   - **Purpose**: Tests handling of invalid difficulty parameter
   - **Checks**: Graceful handling (200 or 500)

##### Quiz Endpoint Tests
5. **`test_generate_quiz_endpoint_with_story_data`**
   - **Purpose**: Tests quiz generation with direct story data
   - **Checks**: Returns quiz with topic and questions

6. **`test_generate_quiz_endpoint_with_story_id`**
   - **Purpose**: Tests quiz generation using cached story ID
   - **Checks**: Retrieves story from cache and generates quiz

7. **`test_generate_quiz_endpoint_no_data`**
   - **Purpose**: Tests quiz endpoint with no input data
   - **Checks**: Handles missing data gracefully (200, 400, or 404)

##### Summary Endpoint Tests
8. **`test_generate_summary_endpoint_with_story_data`**
   - **Purpose**: Tests summary generation with story data
   - **Checks**: Returns summary with topic and learning_summary

##### Story Retrieval Endpoint Tests
9. **`test_get_story_endpoint_not_found`**
   - **Purpose**: Tests story retrieval with invalid ID
   - **Checks**: Returns 404 for non-existent story

10. **`test_get_story_endpoint_success`**
    - **Purpose**: Tests story retrieval with valid ID
    - **Checks**: Returns story, quiz, and summary from cache

11. **`test_latest_story_endpoint_no_stories`**
    - **Purpose**: Tests latest story endpoint with empty cache
    - **Checks**: Returns appropriate response (200 or 404)

12. **`test_latest_story_endpoint_success`**
    - **Purpose**: Tests latest story endpoint with cached stories
    - **Checks**: Returns most recent story

13. **`test_list_stories_endpoint`**
    - **Purpose**: Tests story listing endpoint
    - **Checks**: Returns list of all cached stories

#### Class: `TestAPIErrorHandling`

##### Error Handling Tests
14. **`test_generate_endpoint_api_error`**
    - **Purpose**: Tests API error handling in generate endpoint
    - **Checks**: Returns 500 with error details

15. **`test_generate_quiz_endpoint_validation_error`**
    - **Purpose**: Tests validation error handling
    - **Checks**: Returns 500 for validation errors

16. **`test_generate_quiz_endpoint_invalid_story_id`**
    - **Purpose**: Tests handling of invalid story ID
    - **Checks**: Returns 404 for non-existent story ID

---

## Test Fixtures and Utilities

### Shared Fixtures (`conftest.py`)

All tests share common fixtures defined in `conftest.py`:

#### 1. **`client`**
   - FastAPI TestClient instance
   - Used for API endpoint testing

#### 2. **`mock_gemini_client`**
   - Mocked Gemini API client
   - Returns predefined JSON responses
   - Prevents real API calls during testing

#### 3. **`sample_story_data`**
   - Sample story structure for testing
   - Includes plot, dialogue, visuals, hooks
   - Used across multiple test files

#### 4. **`sample_quiz_data`**
   - Sample quiz structure for testing
   - Includes topic, difficulty, age_group, questions
   - Used in quiz generation tests

#### 5. **`sample_summary_data`**
   - Sample summary structure for testing
   - Includes topic and learning_summary
   - Used in summarizer tests

#### 6. **`sample_user_data`**
   - Sample user preferences structure
   - Includes interests, difficulty, notifications
   - Used in user data loading tests

#### 7. **`mock_cloudinary`**
   - Mocked Cloudinary uploader
   - Returns fake secure URLs
   - Prevents real image uploads during testing

#### 8. **`temp_interests_file`**
   - Temporary interests.json file
   - Created for each test that needs file I/O
   - Automatically cleaned up

#### 9. **`reset_cache`** (autouse=True)
   - Automatically resets all caches before/after each test
   - Ensures test isolation
   - Clears story_cache, quiz_cache, summary_cache

---

## Test Execution

### Running All Tests
```bash
cd FinTales/server/GenAI
pytest tests/ -v
```

### Running Specific Test Categories
```bash
# Unit tests only
pytest tests/unit/ -v

# Module tests only
pytest tests/module/ -v

# Integration tests only
pytest tests/integration/ -v
```

### Running Specific Test Files
```bash
# NovelGenerator tests
pytest tests/unit/test_novel_generator.py -v

# QuizGenerator tests
pytest tests/unit/test_quiz_generator.py -v

# Summarizer tests
pytest tests/unit/test_summarizer.py -v
```

### Running Specific Test Cases
```bash
# Single test
pytest tests/unit/test_novel_generator.py::TestFinancialNovelGenerator::test_init -v

# All tests in a class
pytest tests/unit/test_novel_generator.py::TestFinancialNovelGenerator -v
```

### Test Coverage
```bash
# Generate coverage report
pytest tests/ --cov=. --cov-report=html

# View coverage report
open htmlcov/index.html
```

---

## Test Strategy

### Mocking Strategy
- **All external APIs are mocked** to avoid quota consumption
- **File system operations are mocked** for isolation
- **Cloudinary uploads are mocked** to prevent real uploads
- **Tests use predefined sample data** for consistency

### Test Isolation
- Each test is independent
- Caches are reset before/after each test
- No shared state between tests
- Temporary files are cleaned up automatically

### Error Testing
- Tests verify graceful error handling
- API errors return fallback responses
- Invalid inputs are validated and rejected
- System never crashes, always returns valid responses

### Validation Testing
- Pydantic models are validated
- Input validation is tested
- JSON parsing handles multiple formats
- Error responses maintain structure

---

## Key Testing Principles

1. **No Real API Calls**: All external services are mocked
2. **Fast Execution**: Tests run in milliseconds
3. **Comprehensive Coverage**: Tests cover happy paths, error cases, and edge cases
4. **Isolation**: Tests don't depend on each other
5. **Deterministic**: Tests produce consistent results
6. **Maintainable**: Clear test names and structure

---

## Test Results Summary

**Current Status**: 
- ✅ **Unit Tests**: 44/44 passing
- ✅ **Module Tests**: 3/3 passing  
- ⚠️ **Integration Tests**: 15/16 passing, 1 failing (run separately)
- ⏭️ **Skipped Tests**: 1 (end-to-end with real API)

**Standard Test Suite** (unit + module): 47 passing, 1 skipped
**Integration Tests** (run separately): 15 passing, 1 failing

**Note**: Integration tests are not included in the standard `pytest tests/` run to keep the test suite fast. They can be run separately when needed.

---

## Notes

- **Unit and Module Tests**: Use **mocked APIs** to avoid consuming API quotas
- **Integration Tests**: Test the full API stack but may use mocked dependencies
- All tests are **fast** and can run in CI/CD pipelines
- **Production prompts** are used (not simplified for testing)
- Tests verify **logic and structure**, not actual API generation quality
- **Integration tests are run separately** to keep the standard test suite fast and focused
- Integration tests can be run with: `pytest tests/integration/ -v` or `pytest tests/ -m integration -v`
