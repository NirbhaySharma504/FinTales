#!/usr/bin/env python3
import os, uuid, json, sys
from typing import Dict, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn, traceback
from pydantic import BaseModel

# Fix import paths
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(os.path.dirname(current_dir))

# Now import relative to the current directory
from NovelGenerator import FinancialNovelGenerator
from QuizGenerator import QuizGenerator
from Summarizer import Summarize

app = FastAPI(title="Financial Novel API")
story_cache: Dict[str, dict] = {}
quiz_cache: Dict[str, dict] = {}
summary_cache: Dict[str, dict] = {}

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the generators
generator = FinancialNovelGenerator()
quiz_generator = QuizGenerator()
summarizer = Summarize() 

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

class StoryRequest(BaseModel):
    difficulty: Optional[str] = "beginner"

class QuizRequest(BaseModel):
    story_data: Optional[Dict] = None
    story_id: Optional[str] = None  # If provided, will use cached story
    difficulty: Optional[str] = "beginner"

class SummaryRequest(BaseModel):
    story_data: Optional[Dict] = None
    story_id: Optional[str] = None  # If provided, will use cached story
    selected_interest: Optional[Dict] = None

@app.get("/")
async def root():
    return {"message": "Financial Novel API is running"}

@app.post("/api/load-user-data")
async def load_user_data():
    try:
        generator.load_user_data()
        return {
            "success": True,
            "message": "User data loaded successfully",
            "selected_interest": generator.game_state.selected_interest
        }
    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error loading user data: {str(e)}")

@app.post("/api/generate")
async def generate_story(request: StoryRequest):
    try:
        print("Loading user preferences...")
        generator.load_user_data()  # Load user preferences first
        
        # Set difficulty if provided
        if request.difficulty:
            generator.game_state.difficulty = request.difficulty
        
        print("Generating story from user preferences...")
        story = generator.generate_story_segment()
        print("Story generated successfully")
        
        # Generate quiz
        quiz = quiz_generator.generate_quiz(
            story.dict() if hasattr(story, 'dict') else story.model_dump(), 
            generator.game_state.difficulty
        )
        print("Quiz generated successfully")
        
        # Generate summary with interest context
        summary = summarizer.generate_summary(
            story_data=story.dict() if hasattr(story, 'dict') else story.model_dump(),
            selected_interest=generator.game_state.selected_interest
        )
        print("Summary generated successfully")
        
        # Cache everything
        story_id = str(uuid.uuid4())
        story_cache[story_id] = story.dict() if hasattr(story, 'dict') else story.model_dump()
        quiz_cache[story_id] = quiz.dict() if hasattr(quiz, 'dict') else quiz.model_dump()
        summary_cache[story_id] = summary
        
        print(f"Story cached with ID: {story_id}")
        print(f"Quiz and summary cached with ID: {story_id}")
        
        return {
            "success": True,
            "storyId": story_id,
            "story": story.dict() if hasattr(story, 'dict') else story.model_dump(),
            "quiz": quiz.dict() if hasattr(quiz, 'dict') else quiz.model_dump(),
            "summary": summary
        }
    except Exception as e:
        print("Full error traceback:")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Story generation failed: {str(e)}")

@app.post("/api/generate-quiz")
async def generate_quiz(request: QuizRequest):
    try:
        # Get story_data from cache if story_id is provided, otherwise use provided story_data
        if request.story_id:
            if request.story_id not in story_cache:
                raise HTTPException(status_code=404, detail=f"Story with ID {request.story_id} not found in cache")
            story_data = story_cache[request.story_id]
        elif request.story_data:
            story_data = request.story_data
        else:
            # Try to use latest story if available
            if not story_cache:
                raise HTTPException(status_code=400, detail="No story_data provided and no cached stories available. Either provide story_data or story_id, or generate a story first using /api/generate")
            latest_id = list(story_cache.keys())[-1]
            story_data = story_cache[latest_id]
        
        quiz = quiz_generator.generate_quiz(story_data, request.difficulty)
        return quiz.dict() if hasattr(quiz, 'dict') else quiz.model_dump()
    except HTTPException:
        raise
    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error generating quiz: {str(e)}")

@app.post("/api/generate-summary")
async def generate_summary(request: SummaryRequest):
    try:
        # Get story_data from cache if story_id is provided, otherwise use provided story_data
        if request.story_id:
            if request.story_id not in story_cache:
                raise HTTPException(status_code=404, detail=f"Story with ID {request.story_id} not found in cache")
            story_data = story_cache[request.story_id]
        elif request.story_data:
            story_data = request.story_data
        else:
            # Try to use latest story if available
            if not story_cache:
                raise HTTPException(status_code=400, detail="No story_data provided and no cached stories available. Either provide story_data or story_id, or generate a story first using /api/generate")
            latest_id = list(story_cache.keys())[-1]
            story_data = story_cache[latest_id]
            # Also get selected_interest from generator state if not provided
            if not request.selected_interest:
                request.selected_interest = generator.game_state.selected_interest
        
        summary = summarizer.generate_summary(story_data, request.selected_interest)
        return summary
    except HTTPException:
        raise
    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error generating summary: {str(e)}")

@app.get("/api/story/{story_id}")
async def get_story(story_id: str):
    if story_id in story_cache:
        return {
            "success": True, 
            "story": story_cache[story_id],
            "quiz": quiz_cache.get(story_id),
            "summary": summary_cache.get(story_id)
        }
    raise HTTPException(status_code=404, detail="Story not found")

@app.get("/api/latest-story")
async def get_latest_story():
    try:
        if not story_cache:
            return {
                "success": False,
                "error": "No stories available",
                "message": "Please generate a story first using /api/generate",
                "cached_stories_count": 0
            }
        
        latest_id = list(story_cache.keys())[-1]
        
        return {
            "success": True, 
            "storyId": latest_id,
            "story": story_cache[latest_id],
            "quiz": quiz_cache.get(latest_id),
            "summary": summary_cache.get(latest_id),
            "cached_stories_count": len(story_cache)
        }
    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error retrieving latest story: {str(e)}")

@app.get("/api/stories")
async def list_stories():
    return {
        "success": True,
        "stories": [
            {"id": story_id, "title": story.get("plot", {}).get("title", "Untitled")}
            for story_id, story in story_cache.items()
        ]
    }

def main():
    uvicorn.run(app, host="0.0.0.0", port=8000)

if __name__ == "__main__":
    main()