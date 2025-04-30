from pydantic import BaseModel
from typing import Dict, List
from google import genai
import os
import json

class Summarizer(BaseModel):
    topic: str
    learning_summary: Dict[str, List[str] | str]


class Summarize:
    def __init__(self):
        self.client = genai.Client(api_key=os.getenv("GEMINI_API"))
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        self.summary_dir = os.path.join(base_dir, "output", "summaries")
        os.makedirs(self.summary_dir, exist_ok=True)

    def generate_summary(self, story_data: Dict, selected_interest: Dict = None) -> Dict:
        try:
            plot = story_data["plot"]
            dialogue = story_data["dialogue"]
            visuals = story_data["visuals"]
            
            interest_context = f"\nCharacter Context: {selected_interest['interest']} from {selected_interest['category']}" if selected_interest else ""
            
            prompt = f"""
            Generate a JSON summary of financial lessons from {plot['title']}.
            
            Story Context:
            - Plot: {plot['setup']}
            - Elements: {visuals['financial_elements']}
            - Actions: {', '.join([d['text'] for d in dialogue])}{interest_context}
            
            Return only valid JSON in this exact format:
            {{
                "topic": "{plot['title']}",
                "learning_summary": {{
                    "key_points": [
                        "First key point",
                        "Second key point",
                        "Third key point"
                    ],
                    "benefits": [
                        "First benefit",
                        "Second benefit",
                        "Third benefit"
                    ],
                    "real_world_example": "A concrete example showing application"
                }}
            }}
            """

            response = self.client.models.generate_content(
                model="gemini-2.0-flash-lite",
                contents=prompt,
            )
            
            # Clean the response text and parse JSON
            cleaned_response = response.text.strip()
            if cleaned_response.startswith('```json'):
                cleaned_response = cleaned_response.replace('```json', '').replace('```', '').strip()
            
            summary_data = json.loads(cleaned_response)
            return summary_data

        except Exception as e:
            print(f"Error generating summary: {e}")
            return {
                "topic": plot['title'],
                "learning_summary": {
                    "key_points": ["Key financial concept explained"],
                    "benefits": ["Main advantage of this approach"],
                    "real_world_example": "Basic example from the story"
                }
            }
from pydantic import BaseModel
from typing import Dict, List
from google import genai
import os
import json

class Summarizer(BaseModel):
    topic: str
    learning_summary: Dict[str, List[str] | str]


class Summarize:
    def __init__(self):
        self.client = genai.Client(api_key=os.getenv("GEMINI_API"))
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        self.summary_dir = os.path.join(base_dir, "output", "summaries")
        os.makedirs(self.summary_dir, exist_ok=True)

    def generate_summary(self, story_data: Dict, selected_interest: Dict = None) -> Dict:
        try:
            plot = story_data["plot"]
            dialogue = story_data["dialogue"]
            visuals = story_data["visuals"]
            
            interest_context = f"\nCharacter Context: {selected_interest['interest']} from {selected_interest['category']}" if selected_interest else ""
            
            prompt = f"""
            Generate a JSON summary of financial lessons from {plot['title']}.
            
            Story Context:
            - Plot: {plot['setup']}
            - Elements: {visuals['financial_elements']}
            - Actions: {', '.join([d['text'] for d in dialogue])}{interest_context}
            
            Return only valid JSON in this exact format:
            {{
                "topic": "{plot['title']}",
                "learning_summary": {{
                    "key_points": [
                        "First key point",
                        "Second key point",
                        "Third key point"
                    ],
                    "benefits": [
                        "First benefit",
                        "Second benefit",
                        "Third benefit"
                    ],
                    "real_world_example": "A concrete example showing application"
                }}
            }}
            """

            response = self.client.models.generate_content(
                model="gemini-2.0-flash-lite",
                contents=prompt,
            )
            
            # Clean the response text and parse JSON
            cleaned_response = response.text.strip()
            if cleaned_response.startswith('```json'):
                cleaned_response = cleaned_response.replace('```json', '').replace('```', '').strip()
            
            summary_data = json.loads(cleaned_response)
            return summary_data

        except Exception as e:
            print(f"Error generating summary: {e}")
            return {
                "topic": plot['title'],
                "learning_summary": {
                    "key_points": ["Key financial concept explained"],
                    "benefits": ["Main advantage of this approach"],
                    "real_world_example": "Basic example from the story"
                }
            }
