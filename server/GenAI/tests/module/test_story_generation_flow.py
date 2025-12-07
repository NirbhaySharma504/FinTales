"""
Module-level tests for complete story generation flow
"""
import pytest
from unittest.mock import Mock, MagicMock, patch
import json


@pytest.mark.module
class TestStoryGenerationFlow:
    """Test complete story generation workflow"""
    
    @patch('web_server.generator')
    @patch('web_server.quiz_generator')
    @patch('web_server.summarizer')
    def test_complete_story_generation_flow(self, mock_summarizer, mock_quiz_gen, 
                                            mock_generator, client, sample_story_data,
                                            sample_quiz_data, sample_summary_data):
        """Test complete flow: story -> quiz -> summary"""
        from NovelGenerator import StoryData, Plot, Dialogue, Visuals, Character, Background, Hooks
        from QuizGenerator import Quiz
        
        # Setup mocks
        mock_story = StoryData(
            plot=Plot(**sample_story_data["plot"]),
            dialogue=[Dialogue(**d) for d in sample_story_data["dialogue"]],
            visuals=Visuals(
                characters=[Character(**c) for c in sample_story_data["visuals"]["characters"]],
                backgrounds=[Background(**b) for b in sample_story_data["visuals"]["backgrounds"]],
                financial_elements=sample_story_data["visuals"]["financial_elements"]
            ),
            hooks=Hooks(**sample_story_data["hooks"])
        )
        
        mock_generator.load_user_data.return_value = None
        mock_generator.game_state.difficulty = "beginner"
        mock_generator.game_state.selected_interest = {"category": "Comics & Anime", "interest": "Spider-Man"}
        mock_generator.generate_story_segment.return_value = mock_story
        
        mock_quiz = Quiz(**sample_quiz_data)
        mock_quiz_gen.generate_quiz.return_value = mock_quiz
        
        mock_summarizer.generate_summary.return_value = sample_summary_data
        
        # Execute flow
        response = client.post("/api/generate", json={"difficulty": "beginner"})
        
        # Verify
        assert response.status_code == 200
        data = response.json()
        
        # Verify story was generated
        assert "story" in data
        assert data["story"]["plot"]["title"] == "The Savings Challenge"
        
        # Verify quiz was generated
        assert "quiz" in data
        assert data["quiz"]["topic"] == "Budgeting"
        
        # Verify summary was generated
        assert "summary" in data
        assert data["summary"]["topic"] == "The Savings Challenge"
        
        # Verify caching
        from web_server import story_cache, quiz_cache, summary_cache
        story_id = data["storyId"]
        assert story_id in story_cache
        assert story_id in quiz_cache
        assert story_id in summary_cache


@pytest.mark.module
class TestModuleIntegration:
    """Test integration between modules"""
    
    def test_novel_generator_to_quiz_generator(self, sample_story_data, sample_quiz_data):
        """Test data flow from NovelGenerator to QuizGenerator"""
        from QuizGenerator import QuizGenerator, Quiz
        from unittest.mock import MagicMock, patch
        
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.text = json.dumps(sample_quiz_data)
        mock_client.models.generate_content.return_value = mock_response
        
        with patch('QuizGenerator.genai.Client', return_value=mock_client):
            quiz_gen = QuizGenerator()
            quiz_gen.client = mock_client
            
            quiz = quiz_gen.generate_quiz(sample_story_data, "beginner")
            
            # Verify quiz uses story data
            assert isinstance(quiz, Quiz)
            assert quiz.topic is not None
    
    def test_novel_generator_to_summarizer(self, sample_story_data, sample_summary_data):
        """Test data flow from NovelGenerator to Summarizer"""
        from Summarizer import Summarize
        from unittest.mock import MagicMock, patch
        
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.text = json.dumps(sample_summary_data)
        mock_client.models.generate_content.return_value = mock_response
        
        with patch('Summarizer.genai.Client', return_value=mock_client):
            with patch('os.makedirs'):
                summarizer = Summarize()
                summarizer.client = mock_client
                
                summary = summarizer.generate_summary(
                    sample_story_data,
                    {"category": "Comics & Anime", "interest": "Spider-Man"}
                )
                
                # Verify summary uses story data
                assert summary["topic"] == "The Savings Challenge"
                assert "learning_summary" in summary


@pytest.mark.module
@pytest.mark.slow
class TestEndToEndWorkflow:
    """End-to-end workflow tests (may be slow)"""
    
    @pytest.mark.skip(reason="Requires actual API keys and may be slow")
    def test_real_api_call_workflow(self, client):
        """Test with real API calls (requires API keys)"""
        # This test would make actual API calls
        # Skip by default, enable when needed
        response = client.post("/api/generate", json={"difficulty": "beginner"})
        assert response.status_code == 200

