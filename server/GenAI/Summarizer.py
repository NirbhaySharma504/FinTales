from pydantic import BaseModel
from typing import Dict, List, Optional
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

class Summarizer(BaseModel):
    topic: str
    learning_summary: Dict[str, List[str] | str]


class Summarize:
    def __init__(self):
        try:
            api_key = os.getenv("GEMINI_API")
            if not api_key:
                raise ValueError("GEMINI_API environment variable is not set")
            self.client = genai.Client(api_key=api_key)
            
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
            self.summary_dir = os.path.join(base_dir, "output", "summaries")
            os.makedirs(self.summary_dir, exist_ok=True)
            logger.info("Summarizer initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Summarizer: {e}")
            logger.error(traceback.format_exc())
            raise

    def _validate_story_data(self, story_data: Dict) -> None:
        """Validate that story_data has required fields"""
        required_fields = ["plot", "dialogue", "visuals"]
        missing_fields = [field for field in required_fields if field not in story_data]
        
        if missing_fields:
            raise ValueError(f"Missing required fields in story_data: {missing_fields}")
        
        if "title" not in story_data["plot"]:
            raise ValueError("Missing 'title' in story_data['plot']")
        
        if not isinstance(story_data["dialogue"], list):
            raise ValueError("story_data['dialogue'] must be a list")

    def _parse_json_response(self, response_text: str) -> Dict:
        """Parse JSON from API response with multiple fallback strategies"""
        if not response_text or not response_text.strip():
            raise ValueError("Empty response from API")
        
        # Strategy 1: Direct JSON parsing
        try:
            return json.loads(response_text)
        except json.JSONDecodeError:
            pass
        
        # Strategy 2: Remove markdown code blocks
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

    def generate_summary(self, story_data: Dict, selected_interest: Optional[Dict] = None) -> Dict:
        """
        Generate a summary from story data
        
        Args:
            story_data: Dictionary containing plot, dialogue, and visuals
            selected_interest: Optional dictionary with 'interest' and 'category' keys
            
        Returns:
            Dictionary with topic and learning_summary
        """
        plot_title = "Financial Literacy"
        
        try:
            # Validate input
            try:
                self._validate_story_data(story_data)
            except ValueError:
                # Return fallback for invalid data
                logger.warning("Invalid story data, returning fallback summary")
                return {
                    "topic": plot_title,
                    "learning_summary": {
                        "key_points": ["Key financial concept explained"],
                        "benefits": ["Main advantage of this approach"],
                        "real_world_example": "Practical application example"
                    }
                }
            
            plot = story_data["plot"]
            dialogue = story_data["dialogue"]
            visuals = story_data["visuals"]
            plot_title = plot.get("title", "Financial Literacy")
            
            # Build interest context safely
            interest_context = ""
            if selected_interest:
                try:
                    interest = selected_interest.get('interest', '')
                    category = selected_interest.get('category', '')
                    if interest and category:
                        interest_context = f"\nCharacter Context: {interest} from {category}"
                except (AttributeError, TypeError) as e:
                    logger.warning(f"Error processing selected_interest: {e}")
            
            # Build dialogue text safely
            dialogue_texts = []
            for d in dialogue:
                if isinstance(d, dict) and "text" in d:
                    dialogue_texts.append(d["text"])
                elif isinstance(d, str):
                    dialogue_texts.append(d)
            
            prompt = f"""
            Generate a JSON summary of financial lessons from {plot_title}.
            
            Story Context:
            - Plot: {plot.get('setup', 'Financial education story')}
            - Elements: {visuals.get('financial_elements', 'Financial concepts')}
            - Actions: {', '.join(dialogue_texts) if dialogue_texts else 'Financial planning activities'}{interest_context}
            
            Return only valid JSON in this exact format:
            {{
                "topic": "{plot_title}",
                "learning_summary": {{
                    "key_points": [
                        "First key point about the financial concept",
                        "Second key point about practical application",
                        "Third key point about long-term benefits"
                    ],
                    "benefits": [
                        "First benefit of understanding this concept",
                        "Second benefit for financial planning",
                        "Third benefit for future financial decisions"
                    ],
                    "real_world_example": "A concrete example showing how to apply this concept in everyday life"
                }}
            }}
            """

            logger.info(f"Generating summary for topic: {plot_title}")
            
            # Make API call with error handling
            try:
                response = self.client.models.generate_content(
                    model="gemini-2.0-flash-lite",
                    contents=prompt,
                )
            
                if not response or not hasattr(response, 'text'):
                    raise ValueError("Invalid response from API")
            
                summary_data = self._parse_json_response(response.text)
                logger.info(f"Successfully generated summary for: {plot_title}")
                return summary_data

            except ClientError as e:
                error_code = getattr(e, 'status_code', 'UNKNOWN')
                error_message = str(e)
                logger.error(f"Gemini API error (code: {error_code}): {error_message}")
                
                # Handle specific API errors
                if error_code == 429:
                    logger.warning("Rate limit exceeded, returning fallback summary")
                elif error_code == 401:
                    logger.error("API key invalid or expired")
                elif error_code == 400:
                    logger.error("Invalid request to API")
                
                raise ValueError(f"API request failed: {error_message}")
                
        except ValueError as e:
            logger.error(f"Validation error in generate_summary: {e}")
            raise
        except KeyError as e:
            logger.error(f"Missing key in story_data: {e}")
            logger.error(traceback.format_exc())
            # Return fallback with available data
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error: {e}")
            logger.error(traceback.format_exc())
        except Exception as e:
            logger.error(f"Unexpected error generating summary: {e}")
            logger.error(traceback.format_exc())
        
        # Fallback response
        logger.warning(f"Returning fallback summary for: {plot_title}")
        return {
            "topic": plot_title,
            "learning_summary": {
                "key_points": [
                    "Key financial concept explained",
                    "Important financial principle",
                    "Practical application method"
                ],
                "benefits": [
                    "Main advantage of this approach",
                    "Long-term financial benefits",
                    "Improved financial decision-making"
                ],
                "real_world_example": "Basic example demonstrating the financial concept in everyday life"
                }
            }
