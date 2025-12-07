from pydantic import BaseModel, ValidationError
from typing import List, Dict
from google import genai
from google.genai.errors import ClientError
import os
import json
import logging
import traceback

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class QuizOption(BaseModel):
    text: str
    is_correct: bool

class QuizQuestion(BaseModel):
    question: str
    options: List[QuizOption]
    explanation: str

class Quiz(BaseModel):
    topic: str
    difficulty: str
    age_group: str
    questions: List[QuizQuestion]

class QuizGenerator:
    def __init__(self):
        try:
            api_key = os.getenv("GEMINI_API")
            if not api_key:
                raise ValueError("GEMINI_API environment variable is not set")
            self.client = genai.Client(api_key=api_key)
            logger.info("QuizGenerator initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize QuizGenerator: {e}")
            logger.error(traceback.format_exc())
            raise

    def determine_age_group(self, difficulty: str) -> str:
        """Determine age group based on difficulty level"""
        age_groups = {
            "beginner": "10-12",
            "intermediate": "12-14",
            "advanced": "14-16"
        }
        return age_groups.get(difficulty.lower(), "10-12")

    def _validate_inputs(self, story_data: dict, difficulty: str) -> None:
        """Validate input parameters"""
        if not story_data:
            raise ValueError("story_data cannot be empty")
        
        if not isinstance(story_data, dict):
            raise TypeError("story_data must be a dictionary")
        
        required_keys = ["plot", "visuals"]
        missing_keys = [key for key in required_keys if key not in story_data]
        if missing_keys:
            raise ValueError(f"Missing required keys in story_data: {missing_keys}")
        
        if difficulty not in ["beginner", "intermediate", "advanced"]:
            logger.warning(f"Unknown difficulty '{difficulty}', defaulting to 'beginner'")

    def _parse_json_response(self, response_text: str) -> dict:
        """Parse and validate the JSON response with multiple fallback strategies"""
        if not response_text or not response_text.strip():
            raise ValueError("Empty response from API")
        
        # Strategy 1: Direct JSON parsing
        try:
            return json.loads(response_text)
        except json.JSONDecodeError:
            pass
        
        # Strategy 2: Clean markdown and try again
        cleaned = response_text.replace('```json', '').replace('```', '').strip()
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            pass
        
        # Strategy 3: Extract JSON between braces
        start_idx = cleaned.find('{')
        end_idx = cleaned.rfind('}') + 1
        if start_idx >= 0 and end_idx > start_idx:
            json_content = cleaned[start_idx:end_idx]
            try:
                return json.loads(json_content)
            except json.JSONDecodeError:
                pass
        
        raise ValueError(f"Could not parse JSON from response: {response_text[:200]}...")

    def _get_default_quiz(self, difficulty: str, age_group: str) -> dict:
        """Return a default quiz structure when generation fails"""
        return {
            "topic": "Financial Literacy",
            "difficulty": difficulty,
            "age_group": age_group,
            "questions": [
                {
                    "question": "What is a budget?",
                    "options": [
                        {"text": "A plan for spending and saving money", "is_correct": True},
                        {"text": "A type of bank account", "is_correct": False},
                        {"text": "A kind of credit card", "is_correct": False},
                        {"text": "A government tax", "is_correct": False}
                    ],
                    "explanation": "A budget is a plan that helps you track and manage your money by setting limits on spending and goals for saving."
                }
            ]
        }

    def generate_quiz(self, story_data: dict, difficulty: str) -> Quiz:
        """
        Generate a quiz based on story data
        
        Args:
            story_data: Dictionary containing story information with 'plot' and 'visuals' keys
            difficulty: One of 'beginner', 'intermediate', or 'advanced'
            
        Returns:
            Quiz object with questions and answers
        """
        try:
            # Validate inputs
            self._validate_inputs(story_data, difficulty)
            
            age_group = self.determine_age_group(difficulty)
            plot_title = story_data.get("plot", {}).get("title", "Financial Literacy")
            financial_elements = story_data.get("visuals", {}).get("financial_elements", "financial concepts")
            
            prompt = f"""
        Generate a financial literacy quiz based on this story for age group {age_group} years.
        Story content: {json.dumps(story_data, indent=2)[:1000]}
        
        Create exactly 5 multiple-choice questions following these rules:
            - Questions should test understanding of {plot_title} and {financial_elements}
        - Each question must have 4 options with exactly one correct answer
        - Include clear explanations for wrong answers
        - Match difficulty level: {difficulty}

            Don't ask questions from the story directly. Instead, create real-life situations where the same characters
            are involved in financial decisions. For example, if the story is about Peter Parker, ask questions about 
            his financial decisions like: "Peter Parker is saving money for a new camera, what should he do with his 
            savings?" or "How should he save?" Questions should test understanding of the financial topic.
        
        Return as JSON with this structure:
        {{
            "topic": "Financial concept name",
            "difficulty": "{difficulty}",
            "age_group": "{age_group}",
            "questions": [
                {{
                    "question": "Question text",
                    "options": [
                        {{"text": "Option 1", "is_correct": true}},
                        {{"text": "Option 2", "is_correct": false}},
                        {{"text": "Option 3", "is_correct": false}},
                        {{"text": "Option 4", "is_correct": false}}
                    ],
                    "explanation": "Detailed explanation for wrong answers"
                }}
            ]
        }}
        """

            logger.info(f"Generating quiz for topic: {plot_title}, difficulty: {difficulty}")
            
            # Make API call with error handling
            try:
                response = self.client.models.generate_content(
            model='gemini-2.0-flash-lite',
            contents=prompt
        )
        
                if not response or not hasattr(response, 'text'):
                    raise ValueError("Invalid response from API")
                
                quiz_data = self._parse_json_response(response.text)
                
                # Validate and create Quiz object
                quiz = Quiz(**quiz_data)
                logger.info(f"Successfully generated quiz with {len(quiz.questions)} questions")
                return quiz
                
            except ClientError as e:
                error_code = getattr(e, 'status_code', 'UNKNOWN')
                error_message = str(e)
                logger.error(f"Gemini API error (code: {error_code}): {error_message}")
                
                # Handle specific API errors
                if error_code == 429:
                    logger.warning("Rate limit exceeded, returning default quiz")
                elif error_code == 401:
                    logger.error("API key invalid or expired")
                elif error_code == 400:
                    logger.error("Invalid request to API")
                
                # Return default quiz on API errors
                default_data = self._get_default_quiz(difficulty, age_group)
                return Quiz(**default_data)
                
            except Exception as e:
                logger.error(f"Unexpected error in API call: {e}")
                default_data = self._get_default_quiz(difficulty, age_group)
                return Quiz(**default_data)
                
        except ValueError as e:
            logger.error(f"Validation error in generate_quiz: {e}")
            # Return default quiz
            default_data = self._get_default_quiz(difficulty, self.determine_age_group(difficulty))
            return Quiz(**default_data)
            
        except ValidationError as e:
            logger.error(f"Pydantic validation error: {e}")
            logger.error(traceback.format_exc())
            # Try to fix common validation issues
            try:
                if isinstance(quiz_data, dict):
                    # Ensure all questions have required fields
                    for question in quiz_data.get("questions", []):
                        if "options" in question:
                            for option in question["options"]:
                                if "is_correct" not in option:
                                    option["is_correct"] = False
                    return Quiz(**quiz_data)
            except:
                pass
            
            # Return default quiz
            default_data = self._get_default_quiz(difficulty, self.determine_age_group(difficulty))
            return Quiz(**default_data)
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error: {e}")
            logger.error(traceback.format_exc())
            default_data = self._get_default_quiz(difficulty, self.determine_age_group(difficulty))
            return Quiz(**default_data)
            
        except Exception as e:
            logger.error(f"Unexpected error generating quiz: {e}")
            logger.error(traceback.format_exc())
            default_data = self._get_default_quiz(difficulty, self.determine_age_group(difficulty))
            return Quiz(**default_data)
