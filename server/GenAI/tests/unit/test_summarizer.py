"""
Unit tests for Summarizer module
"""
import pytest
import json
from unittest.mock import Mock, MagicMock, patch
from Summarizer import Summarize, Summarizer


class TestSummarize:
    """Unit tests for Summarize class"""
    
    @pytest.fixture
    def summarizer(self, mock_gemini_client):
        """Create a summarizer with mocked client"""
        with patch('Summarizer.genai.Client', return_value=mock_gemini_client):
            with patch('os.makedirs'):
                gen = Summarize()
                gen.client = mock_gemini_client
                return gen
    
    def test_init(self, mock_gemini_client):
        """Test summarizer initialization"""
        with patch('Summarizer.genai.Client', return_value=mock_gemini_client):
            with patch('os.makedirs'):
                gen = Summarize()
                assert gen is not None
                assert gen.client is not None
    
    def test_init_missing_api_key(self):
        """Test initialization with missing API key"""
        with patch.dict('os.environ', {}, clear=True):
            with pytest.raises(ValueError, match="GEMINI_API"):
                Summarize()
    
    def test_validate_story_data_valid(self, summarizer, sample_story_data):
        """Test validation with valid story data"""
        summarizer._validate_story_data(sample_story_data)
        # Should not raise
    
    def test_validate_story_data_missing_fields(self, summarizer):
        """Test validation with missing fields"""
        invalid_data = {"plot": {}}
        with pytest.raises(ValueError, match="Missing required fields"):
            summarizer._validate_story_data(invalid_data)
    
    def test_validate_story_data_missing_title(self, summarizer):
        """Test validation with missing title"""
        invalid_data = {
            "plot": {},
            "dialogue": [],
            "visuals": {}
        }
        with pytest.raises(ValueError, match="title"):
            summarizer._validate_story_data(invalid_data)
    
    def test_parse_json_response_valid(self, summarizer, sample_summary_data):
        """Test parsing valid JSON response"""
        json_str = json.dumps(sample_summary_data)
        result = summarizer._parse_json_response(json_str)
        assert result["topic"] == "The Savings Challenge"
        assert "key_points" in result["learning_summary"]
    
    def test_parse_json_response_markdown(self, summarizer, sample_summary_data):
        """Test parsing JSON wrapped in markdown"""
        json_str = f"```json\n{json.dumps(sample_summary_data)}\n```"
        result = summarizer._parse_json_response(json_str)
        assert result["topic"] == "The Savings Challenge"
    
    def test_parse_json_response_empty(self, summarizer):
        """Test parsing empty response"""
        with pytest.raises(ValueError, match="Empty response"):
            summarizer._parse_json_response("")
    
    @patch('Summarizer.genai.Client')
    def test_generate_summary_success(self, mock_client_class, sample_story_data, sample_summary_data):
        """Test successful summary generation"""
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.text = json.dumps(sample_summary_data)
        mock_client.models.generate_content.return_value = mock_response
        mock_client_class.return_value = mock_client
        
        with patch('os.makedirs'):
            gen = Summarize()
            gen.client = mock_client
            
            result = gen.generate_summary(sample_story_data, {"category": "Comics & Anime", "interest": "Spider-Man"})
            assert result["topic"] == "The Savings Challenge"
            assert "key_points" in result["learning_summary"]
    
    @patch('Summarizer.genai.Client')
    def test_generate_summary_api_error(self, mock_client_class, sample_story_data):
        """Test summary generation with API error"""
        from google.genai.errors import ClientError
        
        mock_client = MagicMock()
        # Create a mock exception with status_code attribute
        error = Exception("Rate limit exceeded")
        error.status_code = 429
        # Make it look like a ClientError
        mock_client.models.generate_content.side_effect = error
        mock_client_class.return_value = mock_client
        
        with patch('os.makedirs'):
            gen = Summarize()
            gen.client = mock_client
            
            result = gen.generate_summary(sample_story_data)
            # Should return fallback summary
            assert "topic" in result
            assert "learning_summary" in result
    
    def test_generate_summary_invalid_data(self, summarizer):
        """Test summary generation with invalid data"""
        invalid_data = {}
        result = summarizer.generate_summary(invalid_data)
        # Should return fallback
        assert "topic" in result
        assert "learning_summary" in result
    
    def test_generate_summary_without_interest(self, summarizer, sample_story_data, sample_summary_data):
        """Test summary generation without selected interest"""
        with patch.object(summarizer.client.models, 'generate_content') as mock_gen:
            mock_response = MagicMock()
            mock_response.text = json.dumps(sample_summary_data)
            mock_gen.return_value = mock_response
            
            result = summarizer.generate_summary(sample_story_data, None)
            assert result["topic"] == "The Savings Challenge"


class TestSummarizerModel:
    """Unit tests for Summarizer Pydantic model"""
    
    def test_summarizer_model(self, sample_summary_data):
        """Test Summarizer model validation"""
        summary = Summarizer(**sample_summary_data)
        assert summary.topic == "The Savings Challenge"
        assert "key_points" in summary.learning_summary

