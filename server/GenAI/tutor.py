from pydantic import BaseModel
from typing import List, Optional
from google import genai
import os
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("GEMINI_API")

class Message(BaseModel):
    role: str
    content: str
    timestamp: Optional[str]

class ChatHistory(BaseModel):
    messages: List[Message] = []

class FinancialTutor:
    def __init__(self):
        self.client = genai.Client(api_key=API_KEY)
        self.model = "gemini-2.0-flash-lite"

    async def get_response(self, query: str, chat_history: ChatHistory) -> str:
        chat_context = "\n".join([f"{msg.role}: {msg.content}" for msg in chat_history.messages[-5:]])
        
        prompt = f"""
        You are a friendly financial tutor. Help answer questions about personal finance.
        
        Previous conversation:
        {chat_context}

        User question: {query}

        Provide a helpful, accurate response focused on financial education.
        """

        response = self.client.models.generate_content(
            model=self.model,
            contents=prompt,
            generation_config={
                "temperature": 0.7,
                "top_p": 0.8,
                "top_k": 40
            }
        )

        return response.text
