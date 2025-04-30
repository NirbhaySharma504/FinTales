from pydantic import BaseModel
from typing import List, Dict
from google import genai
import os
import json

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
        self.client = genai.Client(api_key=os.getenv("GEMINI_API"))

    def determine_age_group(self, difficulty: str) -> str:
        age_groups = {
            "beginner": "10-12",
            "intermediate": "12-14",
            "advanced": "14-16"
        }
        return age_groups.get(difficulty, "10-12")

    def generate_quiz(self, story_data: dict, difficulty: str) -> Quiz:
        age_group = self.determine_age_group(difficulty)
        
        prompt = f"""
        Generate a financial literacy quiz based on this story for age group {age_group} years.
        Story content: {story_data}
        
        Create exactly 5 multiple-choice questions following these rules:
        - Questions should test understanding of {story_data['plot']['title']} and {story_data['visuals']['financial_elements']}
        - Each question must have 4 options with exactly one correct answer
        - Include clear explanations for wrong answers
        - Match difficulty level: {difficulty}

        Dont Ask questions from the story, instead have a real life situation for the quiz, where the same characters
        are involved in a financial situation. For example, if the story is about Peter Parker, ask questions about his financial decisions.
        like peter parker is saving money for a new camera, what should he do with his savings? or how should he save, questions like these should be there
        in the quiz depicting the financial topic. 
        
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

        response = self.client.models.generate_content(
            model='gemini-2.0-flash-lite',
            contents=prompt
        )
        
        quiz_data = self._parse_response(response.text)
        return Quiz(**quiz_data)
        
    def _parse_response(self, response_text: str) -> dict:
        """Parse and validate the JSON response"""
        try:
            # Direct JSON parsing
            data = json.loads(response_text)
            return data
        except json.JSONDecodeError:
            # Clean markdown and try again
            cleaned = response_text.replace('```json', '').replace('```', '').strip()
            try:
                data = json.loads(cleaned)
                return data
            except:
                # Extract JSON between braces
                start_idx = cleaned.find('{')
                end_idx = cleaned.rfind('}') + 1
                if start_idx >= 0 and end_idx > start_idx:
                    json_content = cleaned[start_idx:end_idx]
                    data = json.loads(json_content)
                    return data
                
                # Return default structure
                return {
                    "topic": "Financial Literacy",
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
from pydantic import BaseModel
from typing import List, Dict
from google import genai
import os
import json

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
        self.client = genai.Client(api_key=os.getenv("GEMINI_API"))

    def determine_age_group(self, difficulty: str) -> str:
        age_groups = {
            "beginner": "10-12",
            "intermediate": "12-14",
            "advanced": "14-16"
        }
        return age_groups.get(difficulty, "10-12")

    def generate_quiz(self, story_data: dict, difficulty: str) -> Quiz:
        age_group = self.determine_age_group(difficulty)
        
        prompt = f"""
        Generate a financial literacy quiz based on this story for age group {age_group} years.
        Story content: {story_data}
        
        Create exactly 5 multiple-choice questions following these rules:
        - Questions should test understanding of {story_data['plot']['title']} and {story_data['visuals']['financial_elements']}
        - Each question must have 4 options with exactly one correct answer
        - Include clear explanations for wrong answers
        - Match difficulty level: {difficulty}

        Dont Ask questions from the story, instead have a real life situation for the quiz, where the same characters
        are involved in a financial situation. For example, if the story is about Peter Parker, ask questions about his financial decisions.
        like peter parker is saving money for a new camera, what should he do with his savings? or how should he save, questions like these should be there
        in the quiz depicting the financial topic. 
        
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

        response = self.client.models.generate_content(
            model='gemini-2.0-flash-lite',
            contents=prompt
        )
        
        quiz_data = self._parse_response(response.text)
        return Quiz(**quiz_data)
        
    def _parse_response(self, response_text: str) -> dict:
        """Parse and validate the JSON response"""
        try:
            # Direct JSON parsing
            data = json.loads(response_text)
            return data
        except json.JSONDecodeError:
            # Clean markdown and try again
            cleaned = response_text.replace('```json', '').replace('```', '').strip()
            try:
                data = json.loads(cleaned)
                return data
            except:
                # Extract JSON between braces
                start_idx = cleaned.find('{')
                end_idx = cleaned.rfind('}') + 1
                if start_idx >= 0 and end_idx > start_idx:
                    json_content = cleaned[start_idx:end_idx]
                    data = json.loads(json_content)
                    return data
                
                # Return default structure
                return {
                    "topic": "Financial Literacy",
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
