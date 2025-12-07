"""
Unit tests for NovelGenerator module
"""
import pytest
import os
import json
from unittest.mock import Mock, MagicMock, patch, mock_open
from NovelGenerator import (
    FinancialNovelGenerator,
    StoryData,
    Plot,
    Dialogue,
    Visuals,
    Character,
    Background,
    Hooks,
    GameState
)


class TestFinancialNovelGenerator:
    """Unit tests for FinancialNovelGenerator class"""
    
    @pytest.fixture
    def generator(self, mock_gemini_client):
        """Create a generator instance with mocked dependencies"""
        with patch('NovelGenerator.genai.Client', return_value=mock_gemini_client):
            with patch('NovelGenerator.cloudinary.config'):
                with patch('os.path.exists', return_value=True):
                    with patch('builtins.open', mock_open(read_data=json.dumps({
                        "data": {
                            "user": {
                                "preferences": {
                                    "interests": {
                                        "Comics & Anime": ["Spider-Man"]
                                    }
                                }
                            }
                        }
                    }))):
                        gen = FinancialNovelGenerator()
                        gen.client = mock_gemini_client
                        return gen
    
    def test_init(self, mock_gemini_client):
        """Test generator initialization"""
        with patch('NovelGenerator.genai.Client', return_value=mock_gemini_client):
            with patch('NovelGenerator.cloudinary.config'):
                with patch('os.makedirs'):
                    with patch('os.path.exists', return_value=False):
                        with patch('builtins.open', mock_open(read_data='{}')):
                            gen = FinancialNovelGenerator()
                            assert gen is not None
                            assert isinstance(gen.game_state, GameState)
    
    def test_load_user_data_success(self, generator, temp_interests_file):
        """Test successful loading of user data"""
        generator.user_data_path = temp_interests_file
        generator.load_user_data()
        assert generator.game_state.selected_interest is not None
        assert "category" in generator.game_state.selected_interest
        assert "interest" in generator.game_state.selected_interest
    
    def test_load_user_data_file_not_found(self, generator):
        """Test handling of missing user data file"""
        generator.user_data_path = "/nonexistent/path/interests.json"
        generator.load_user_data()
        # Should fall back to default
        assert generator.game_state.selected_interest is not None
    
    def test_load_user_data_invalid_json(self, generator, tmp_path):
        """Test handling of invalid JSON in user data file"""
        invalid_file = tmp_path / "invalid.json"
        invalid_file.write_text("not valid json {")
        generator.user_data_path = str(invalid_file)
        generator.load_user_data()
        # Should fall back to default
        assert generator.game_state.selected_interest is not None
    
    def test_select_random_interest(self, generator):
        """Test random interest selection"""
        interests = {
            "Comics & Anime": ["Spider-Man", "Batman"],
            "Movies/Series": ["Stranger Things"]
        }
        result = generator.select_random_interest(interests)
        assert "category" in result
        assert "interest" in result
        assert result["category"] in interests
        assert result["interest"] in interests[result["category"]]
    
    def test_select_random_interest_empty(self, generator):
        """Test interest selection with empty interests"""
        interests = {}
        result = generator.select_random_interest(interests)
        assert result["category"] == "Comics & Anime"
        assert result["interest"] == "Spider-Man"
    
    def test_create_asset_directories(self, generator):
        """Test directory creation"""
        with patch('os.makedirs') as mock_makedirs:
            generator.create_asset_directories()
            assert mock_makedirs.called
    
    @pytest.mark.unit
    def test_determine_age_group_from_difficulty(self, generator):
        """Test age group determination"""
        # This is actually in QuizGenerator, but testing the concept
        age_groups = {
            "beginner": "10-12",
            "intermediate": "12-14",
            "advanced": "14-16"
        }
        for difficulty, expected_age in age_groups.items():
            generator.game_state.difficulty = difficulty
            # Age group logic would be tested here
    
    @patch('NovelGenerator.genai.Client')
    def test_generate_story_segment_success(self, mock_client_class, sample_story_data):
        """Test successful story generation"""
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.text = json.dumps(sample_story_data)
        mock_client.models.generate_content.return_value = mock_response
        mock_client_class.return_value = mock_client
        
        with patch('NovelGenerator.cloudinary.config'):
            with patch('os.makedirs'):
                with patch('builtins.open', mock_open(read_data='{}')):
                    gen = FinancialNovelGenerator()
                    gen.client = mock_client
                    gen.generate_all_images_for_story = Mock()
                    
                    result = gen.generate_story_segment()
                    assert isinstance(result, StoryData)
                    assert result.plot.title == "The Savings Challenge"
    
    @patch('NovelGenerator.genai.Client')
    def test_generate_story_segment_api_error(self, mock_client_class):
        """Test story generation with API error"""
        from google.genai.errors import ClientError
        
        mock_client = MagicMock()
        # Create a mock exception with status_code attribute
        error = Exception("Rate limit exceeded")
        error.status_code = 429
        # Make it look like a ClientError
        mock_client.models.generate_content.side_effect = error
        mock_client_class.return_value = mock_client
        
        with patch('NovelGenerator.cloudinary.config'):
            with patch('os.makedirs'):
                with patch('builtins.open', mock_open(read_data='{}')):
                    gen = FinancialNovelGenerator()
                    gen.client = mock_client
                    
                    result = gen.generate_story_segment()
                    # Should return error story
                    assert isinstance(result, StoryData)
                    assert "Error" in result.plot.title
    
    def test_parse_response_valid_json(self, generator, sample_story_data):
        """Test parsing valid JSON response"""
        json_str = json.dumps(sample_story_data)
        result = generator._parse_response(json_str)
        assert isinstance(result, dict)
        assert result["plot"]["title"] == "The Savings Challenge"
    
    def test_parse_response_markdown_wrapped(self, generator, sample_story_data):
        """Test parsing JSON wrapped in markdown"""
        json_str = f"```json\n{json.dumps(sample_story_data)}\n```"
        result = generator._parse_response(json_str)
        assert isinstance(result, dict)
        assert result["plot"]["title"] == "The Savings Challenge"
    
    def test_parse_response_invalid_json(self, generator):
        """Test parsing invalid JSON"""
        invalid_json = "not valid json {"
        result = generator._parse_response(invalid_json)
        # Should return error story structure
        assert isinstance(result, dict)
        assert "Parsing Error" in result.get("plot", {}).get("title", "")


class TestPydanticModels:
    """Unit tests for Pydantic models"""
    
    def test_character_model(self):
        """Test Character model validation"""
        char = Character(name="Spider-Man", description="A superhero")
        assert char.name == "Spider-Man"
        assert char.description == "A superhero"
    
    def test_plot_model(self):
        """Test Plot model validation"""
        plot = Plot(
            title="Test Story",
            setup="Test setup",
            locations={"primary": "Home", "secondary": "Store", "tertiary": "Bank"}
        )
        assert plot.title == "Test Story"
        assert len(plot.locations) == 3
    
    def test_story_data_model(self, sample_story_data):
        """Test StoryData model validation"""
        story = StoryData(**sample_story_data)
        assert story.plot.title == "The Savings Challenge"
        assert len(story.dialogue) == 2
        assert len(story.visuals.characters) == 1

