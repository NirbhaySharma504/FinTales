"""
Shared fixtures and configuration for all tests
"""
import os
import sys
import pytest
from unittest.mock import Mock, MagicMock, patch
from typing import Dict, Any
import json
from pathlib import Path

# Add parent directory to path to import modules
sys.path.insert(0, str(Path(__file__).parent.parent))

# Set test environment variables before imports
os.environ["GEMINI_API"] = "test_api_key_12345"
os.environ["CLOUD_NAME"] = "test_cloud"
os.environ["CLOUDINARY_API_KEY"] = "test_cloudinary_key"
os.environ["CLOUDINARY_API_SECRET"] = "test_cloudinary_secret"

from fastapi.testclient import TestClient
from web_server import app

@pytest.fixture
def client():
    """FastAPI test client"""
    return TestClient(app)

@pytest.fixture
def mock_gemini_client():
    """Mock Gemini API client"""
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.text = json.dumps({
        "plot": {
            "title": "Test Story",
            "setup": "Test setup",
            "locations": {
                "primary": "Test Primary",
                "secondary": "Test Secondary",
                "tertiary": "Test Tertiary"
            }
        },
        "dialogue": [
            {
                "character": "Test Character",
                "text": "Test dialogue",
                "hint": "Test hint"
            }
        ],
        "visuals": {
            "characters": [
                {
                    "name": "Test Character",
                    "description": "Test description"
                }
            ],
            "backgrounds": [
                {
                    "name": "Test Background",
                    "description": "Test background description",
                    "type": "primary"
                }
            ],
            "financial_elements": "Test financial elements"
        },
        "hooks": {
            "pop_culture": "Test pop culture",
            "music": "Test music"
        }
    })
    mock_client.models.generate_content.return_value = mock_response
    return mock_client

@pytest.fixture
def sample_story_data():
    """Sample story data for testing"""
    return {
        "plot": {
            "title": "The Savings Challenge",
            "setup": "A character learns about saving money",
            "locations": {
                "primary": "Home",
                "secondary": "Store",
                "tertiary": "Bank"
            }
        },
        "dialogue": [
            {
                "character": "Spider-Man",
                "text": "I need to save $1000 for a new camera",
                "hint": "Set savings goals"
            },
            {
                "character": "Spider-Man",
                "text": "I'll save $100 each month",
                "hint": "Break goals into smaller amounts"
            }
        ],
        "visuals": {
            "characters": [
                {
                    "name": "Spider-Man",
                    "description": "A superhero learning about finances"
                }
            ],
            "backgrounds": [
                {
                    "name": "Home",
                    "description": "A cozy home setting",
                    "type": "primary"
                }
            ],
            "financial_elements": "Savings tracker and piggy bank"
        },
        "hooks": {
            "pop_culture": "Comics & Anime",
            "music": "Upbeat and motivational"
        }
    }

@pytest.fixture
def sample_quiz_data():
    """Sample quiz data for testing"""
    return {
        "topic": "Budgeting",
        "difficulty": "beginner",
        "age_group": "10-12",
        "questions": [
            {
                "question": "What is a budget?",
                "options": [
                    {"text": "A plan for spending and saving money", "is_correct": True},
                    {"text": "A type of bank account", "is_correct": False},
                    {"text": "A kind of credit card", "is_correct": False},
                    {"text": "A government tax", "is_correct": False}
                ],
                "explanation": "A budget is a plan that helps you track and manage your money."
            }
        ]
    }

@pytest.fixture
def sample_summary_data():
    """Sample summary data for testing"""
    return {
        "topic": "The Savings Challenge",
        "learning_summary": {
            "key_points": [
                "Setting clear savings goals is important",
                "Breaking goals into smaller amounts makes them achievable",
                "Tracking progress helps stay motivated"
            ],
            "benefits": [
                "Better financial planning",
                "Achieving financial goals",
                "Building good money habits"
            ],
            "real_world_example": "Saving $100 each month to buy a $1000 camera in 10 months"
        }
    }

@pytest.fixture
def sample_user_data():
    """Sample user data for testing"""
    return {
        "success": True,
        "message": "User profile retrieved",
        "data": {
            "user": {
                "preferences": {
                    "interests": {
                        "Music Artists": ["Drake", "The Weeknd"],
                        "Movies/Series": ["Stranger Things"],
                        "Comics & Anime": ["Spider-Man", "Demon Slayer"]
                    },
                    "difficulty": "beginner",
                    "notifications": True
                },
                "_id": "test_user_id",
                "name": "Test User",
                "email": "test@example.com"
            }
        }
    }

@pytest.fixture
def mock_cloudinary():
    """Mock Cloudinary uploader"""
    with patch('cloudinary.uploader.upload') as mock_upload:
        mock_upload.return_value = {
            'secure_url': 'https://res.cloudinary.com/test/image/upload/test.jpg'
        }
        yield mock_upload

@pytest.fixture
def temp_interests_file(tmp_path):
    """Create a temporary interests.json file"""
    interests_data = {
        "success": True,
        "message": "User profile retrieved",
        "data": {
            "user": {
                "preferences": {
                    "interests": {
                        "Music Artists": ["Drake"],
                        "Movies/Series": ["Stranger Things"],
                        "Comics & Anime": ["Spider-Man"]
                    },
                    "difficulty": "beginner"
                }
            }
        }
    }
    file_path = tmp_path / "interests.json"
    with open(file_path, 'w') as f:
        json.dump(interests_data, f)
    return str(file_path)

@pytest.fixture(autouse=True)
def reset_cache():
    """Reset caches before each test"""
    from web_server import story_cache, quiz_cache, summary_cache
    story_cache.clear()
    quiz_cache.clear()
    summary_cache.clear()
    yield
    story_cache.clear()
    quiz_cache.clear()
    summary_cache.clear()

