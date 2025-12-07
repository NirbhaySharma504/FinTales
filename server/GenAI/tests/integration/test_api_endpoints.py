"""
Integration tests for FastAPI endpoints
"""
import pytest
import json
from unittest.mock import Mock, MagicMock, patch
from fastapi.testclient import TestClient


@pytest.mark.integration
class TestAPIEndpoints:
    """Integration tests for API endpoints"""
    
    def test_root_endpoint(self, client):
        """Test root endpoint"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "Financial Novel API" in data["message"]
    
    def test_load_user_data_endpoint(self, client):
        """Test load user data endpoint"""
        with patch('web_server.generator.load_user_data'):
            response = client.post("/api/load-user-data")
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert "message" in data
    
    @patch('web_server.generator')
    @patch('web_server.quiz_generator')
    @patch('web_server.summarizer')
    def test_generate_endpoint_success(self, mock_summarizer, mock_quiz_gen, mock_generator, 
                                       client, sample_story_data, sample_quiz_data, sample_summary_data):
        """Test story generation endpoint"""
        from NovelGenerator import StoryData, Plot, Dialogue, Visuals, Character, Background, Hooks
        
        # Mock story generation
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
        
        # Mock quiz generation
        from QuizGenerator import Quiz, QuizQuestion, QuizOption
        mock_quiz = Quiz(**sample_quiz_data)
        mock_quiz_gen.generate_quiz.return_value = mock_quiz
        
        # Mock summary generation
        mock_summarizer.generate_summary.return_value = sample_summary_data
        
        response = client.post("/api/generate", json={"difficulty": "beginner"})
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "storyId" in data
        assert "story" in data
        assert "quiz" in data
        assert "summary" in data
    
    def test_generate_endpoint_invalid_difficulty(self, client):
        """Test generate endpoint with invalid difficulty"""
        response = client.post("/api/generate", json={"difficulty": "invalid"})
        # Should still work but use default
        assert response.status_code in [200, 500]  # May fail or use default
    
    @patch('web_server.quiz_generator')
    def test_generate_quiz_endpoint_with_story_data(self, mock_quiz_gen, client, 
                                                    sample_story_data, sample_quiz_data):
        """Test quiz generation endpoint with story data"""
        from QuizGenerator import Quiz
        mock_quiz = Quiz(**sample_quiz_data)
        mock_quiz_gen.generate_quiz.return_value = mock_quiz
        
        response = client.post(
            "/api/generate-quiz",
            json={
                "story_data": sample_story_data,
                "difficulty": "beginner"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "topic" in data
        assert "questions" in data
    
    @patch('web_server.quiz_generator')
    def test_generate_quiz_endpoint_with_story_id(self, mock_quiz_gen, client, 
                                                   sample_story_data, sample_quiz_data):
        """Test quiz generation endpoint with story ID"""
        from QuizGenerator import Quiz
        mock_quiz = Quiz(**sample_quiz_data)
        mock_quiz_gen.generate_quiz.return_value = mock_quiz
        
        # First, add a story to cache
        from web_server import story_cache
        story_id = "test-story-id"
        story_cache[story_id] = sample_story_data
        
        response = client.post(
            "/api/generate-quiz",
            json={
                "story_id": story_id,
                "difficulty": "beginner"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "topic" in data
    
    def test_generate_quiz_endpoint_no_data(self, client):
        """Test quiz generation endpoint with no data"""
        response = client.post("/api/generate-quiz", json={})
        # Should use latest story or return error
        assert response.status_code in [200, 400, 404]
    
    @patch('web_server.summarizer')
    def test_generate_summary_endpoint_with_story_data(self, mock_summarizer, client,
                                                        sample_story_data, sample_summary_data):
        """Test summary generation endpoint with story data"""
        mock_summarizer.generate_summary.return_value = sample_summary_data
        
        response = client.post(
            "/api/generate-summary",
            json={
                "story_data": sample_story_data,
                "selected_interest": {"category": "Comics & Anime", "interest": "Spider-Man"}
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "topic" in data
        assert "learning_summary" in data
    
    def test_get_story_endpoint_not_found(self, client):
        """Test get story endpoint with non-existent ID"""
        response = client.get("/api/story/nonexistent-id")
        assert response.status_code == 404
    
    def test_get_story_endpoint_success(self, client, sample_story_data):
        """Test get story endpoint with valid ID"""
        from web_server import story_cache, quiz_cache, summary_cache
        story_id = "test-story-123"
        story_cache[story_id] = sample_story_data
        quiz_cache[story_id] = {"topic": "Test"}
        summary_cache[story_id] = {"topic": "Test"}
        
        response = client.get(f"/api/story/{story_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "story" in data
    
    def test_latest_story_endpoint_no_stories(self, client):
        """Test latest story endpoint with no cached stories"""
        response = client.get("/api/latest-story")
        # Should return error or empty response
        assert response.status_code in [200, 404]
        if response.status_code == 200:
            data = response.json()
            assert data.get("success") is False or "cached_stories_count" in data
    
    def test_latest_story_endpoint_success(self, client, sample_story_data):
        """Test latest story endpoint with cached stories"""
        from web_server import story_cache, quiz_cache, summary_cache
        story_id = "latest-story"
        story_cache[story_id] = sample_story_data
        quiz_cache[story_id] = {"topic": "Test"}
        summary_cache[story_id] = {"topic": "Test"}
        
        response = client.get("/api/latest-story")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "story" in data
        assert data["storyId"] == story_id
    
    def test_list_stories_endpoint(self, client, sample_story_data):
        """Test list stories endpoint"""
        from web_server import story_cache
        story_cache["story1"] = sample_story_data
        story_cache["story2"] = sample_story_data
        
        response = client.get("/api/stories")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "stories" in data
        assert len(data["stories"]) >= 2


@pytest.mark.integration
class TestAPIErrorHandling:
    """Test error handling in API endpoints"""
    
    @patch('web_server.generator')
    def test_generate_endpoint_api_error(self, mock_generator, client):
        """Test generate endpoint with API error"""
        mock_generator.load_user_data.side_effect = Exception("API Error")
        
        response = client.post("/api/generate", json={"difficulty": "beginner"})
        assert response.status_code == 500
        data = response.json()
        assert "detail" in data
    
    @patch('web_server.quiz_generator')
    def test_generate_quiz_endpoint_validation_error(self, mock_quiz_gen, client):
        """Test quiz generation with validation error"""
        mock_quiz_gen.generate_quiz.side_effect = ValueError("Invalid story data")
        
        # Use invalid but non-empty story_data so it reaches the generator
        # Empty dict {} is falsy and would return 400 before reaching generator
        response = client.post(
            "/api/generate-quiz",
            json={"story_data": {"invalid": "data"}, "difficulty": "beginner"}
        )
        assert response.status_code == 500
        data = response.json()
        assert "detail" in data
        assert "Invalid story data" in data["detail"]
    
    def test_generate_quiz_endpoint_invalid_story_id(self, client):
        """Test quiz generation with invalid story ID"""
        response = client.post(
            "/api/generate-quiz",
            json={"story_id": "invalid-id", "difficulty": "beginner"}
        )
        assert response.status_code == 404

