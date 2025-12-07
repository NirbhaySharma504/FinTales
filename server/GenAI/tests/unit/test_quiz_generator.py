"""
Unit tests for QuizGenerator module
"""
import pytest
import json
from unittest.mock import Mock, MagicMock, patch
from QuizGenerator import QuizGenerator, Quiz, QuizQuestion, QuizOption


class TestQuizGenerator:
    """Unit tests for QuizGenerator class"""
    
    @pytest.fixture
    def quiz_generator(self, mock_gemini_client):
        """Create a quiz generator with mocked client"""
        with patch('QuizGenerator.genai.Client', return_value=mock_gemini_client):
            gen = QuizGenerator()
            gen.client = mock_gemini_client
            return gen
    
    def test_init(self, mock_gemini_client):
        """Test quiz generator initialization"""
        with patch('QuizGenerator.genai.Client', return_value=mock_gemini_client):
            gen = QuizGenerator()
            assert gen is not None
            assert gen.client is not None
    
    def test_init_missing_api_key(self):
        """Test initialization with missing API key"""
        with patch.dict('os.environ', {}, clear=True):
            with pytest.raises(ValueError, match="GEMINI_API"):
                QuizGenerator()
    
    def test_determine_age_group(self, quiz_generator):
        """Test age group determination"""
        assert quiz_generator.determine_age_group("beginner") == "10-12"
        assert quiz_generator.determine_age_group("intermediate") == "12-14"
        assert quiz_generator.determine_age_group("advanced") == "14-16"
        assert quiz_generator.determine_age_group("unknown") == "10-12"  # default
    
    def test_validate_inputs_valid(self, quiz_generator, sample_story_data):
        """Test input validation with valid data"""
        quiz_generator._validate_inputs(sample_story_data, "beginner")
        # Should not raise
    
    def test_validate_inputs_empty_story_data(self, quiz_generator):
        """Test input validation with empty story data"""
        with pytest.raises(ValueError, match="cannot be empty"):
            quiz_generator._validate_inputs({}, "beginner")
    
    def test_validate_inputs_missing_keys(self, quiz_generator):
        """Test input validation with missing required keys"""
        invalid_data = {"plot": {}}
        with pytest.raises(ValueError, match="Missing required keys"):
            quiz_generator._validate_inputs(invalid_data, "beginner")
    
    def test_parse_json_response_valid(self, quiz_generator, sample_quiz_data):
        """Test parsing valid JSON response"""
        json_str = json.dumps(sample_quiz_data)
        result = quiz_generator._parse_json_response(json_str)
        assert result["topic"] == "Budgeting"
        assert len(result["questions"]) == 1
    
    def test_parse_json_response_markdown(self, quiz_generator, sample_quiz_data):
        """Test parsing JSON wrapped in markdown"""
        json_str = f"```json\n{json.dumps(sample_quiz_data)}\n```"
        result = quiz_generator._parse_json_response(json_str)
        assert result["topic"] == "Budgeting"
    
    def test_parse_json_response_empty(self, quiz_generator):
        """Test parsing empty response"""
        with pytest.raises(ValueError, match="Empty response"):
            quiz_generator._parse_json_response("")
    
    @patch('QuizGenerator.genai.Client')
    def test_generate_quiz_success(self, mock_client_class, sample_story_data, sample_quiz_data):
        """Test successful quiz generation"""
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.text = json.dumps(sample_quiz_data)
        mock_client.models.generate_content.return_value = mock_response
        mock_client_class.return_value = mock_client
        
        gen = QuizGenerator()
        gen.client = mock_client
        
        result = gen.generate_quiz(sample_story_data, "beginner")
        assert isinstance(result, Quiz)
        assert result.topic == "Budgeting"
        assert len(result.questions) == 1
    
    @patch('QuizGenerator.genai.Client')
    def test_generate_quiz_api_error(self, mock_client_class, sample_story_data):
        """Test quiz generation with API error"""
        from google.genai.errors import ClientError
        
        mock_client = MagicMock()
        # Create a mock exception with status_code attribute
        error = Exception("Rate limit exceeded")
        error.status_code = 429
        # Make it look like a ClientError
        mock_client.models.generate_content.side_effect = error
        mock_client_class.return_value = mock_client
        
        gen = QuizGenerator()
        gen.client = mock_client
        
        result = gen.generate_quiz(sample_story_data, "beginner")
        # Should return default quiz
        assert isinstance(result, Quiz)
        assert result.topic == "Financial Literacy"
    
    def test_get_default_quiz(self, quiz_generator):
        """Test default quiz generation"""
        result = quiz_generator._get_default_quiz("beginner", "10-12")
        assert result["topic"] == "Financial Literacy"
        assert result["difficulty"] == "beginner"
        assert result["age_group"] == "10-12"
        assert len(result["questions"]) == 1


class TestQuizModels:
    """Unit tests for Quiz Pydantic models"""
    
    def test_quiz_option(self):
        """Test QuizOption model"""
        option = QuizOption(text="Option 1", is_correct=True)
        assert option.text == "Option 1"
        assert option.is_correct is True
    
    def test_quiz_question(self):
        """Test QuizQuestion model"""
        question = QuizQuestion(
            question="What is a budget?",
            options=[
                QuizOption(text="Option 1", is_correct=True),
                QuizOption(text="Option 2", is_correct=False)
            ],
            explanation="Test explanation"
        )
        assert question.question == "What is a budget?"
        assert len(question.options) == 2
        assert question.explanation == "Test explanation"
    
    def test_quiz_model(self, sample_quiz_data):
        """Test Quiz model"""
        quiz = Quiz(**sample_quiz_data)
        assert quiz.topic == "Budgeting"
        assert quiz.difficulty == "beginner"
        assert quiz.age_group == "10-12"
        assert len(quiz.questions) == 1

