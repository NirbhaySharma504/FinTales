import os
import json
import io
import datetime, traceback
import mimetypes
import random,logging
from PIL import Image
from dotenv import load_dotenv
from google import genai
from google.genai import types
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
import cloudinary
import cloudinary.uploader

load_dotenv()
API_KEY = os.getenv("GEMINI_API")

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv('CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)

# Pydantic Models
class Character(BaseModel):
    name: str
    description: str

class Background(BaseModel):
    name: str
    description: str
    type: str  # primary, secondary, or tertiary

class Dialogue(BaseModel):
    character: str
    text: str
    hint: Optional[str] = None

class Plot(BaseModel):
    title: str
    setup: str
    locations: Dict[str, str]  # primary, secondary, tertiary locations

class Visuals(BaseModel):
    characters: List[Character]
    backgrounds: List[Background]
    financial_elements: str

class Hooks(BaseModel):
    pop_culture: str
    music: str

class UserPreferences(BaseModel):
    interests: Dict[str, List[str]]
    difficulty: str = "beginner"

class StoryData(BaseModel):
    plot: Plot
    dialogue: List[Dialogue]
    visuals: Visuals
    hooks: Hooks
    generated_images: Optional[Dict] = Field(default_factory=dict)

class GameState(BaseModel):
    difficulty: str = "beginner"
    selected_concept: Dict[str, str] = {
        "topic": "Budgeting",
        "subtopic": "What is a Budget and Why It Matters"
    }
    selected_interest: Optional[Dict[str, str]] = None
    user_data: Optional[Dict] = None

class FinancialNovelGenerator:
    def __init__(self):
        self.game_state = GameState()
        self.client = genai.Client(api_key=API_KEY)
        self.create_asset_directories()
        self.user_data_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
                                         "server", "GenAI", "interests.json")
        self.load_user_data()

    def load_user_data(self):
        try:
            with open(self.user_data_path, 'r') as f:
                user_data = json.load(f)
                self.game_state.user_data = user_data
                interests = user_data["data"]["user"]["preferences"]["interests"]
                if interests:
                    self.game_state.selected_interest = self.select_random_interest(interests)
        except Exception as e:
            print(f"Error loading user data: {e}")
            # Set default interest if loading fails
            self.game_state.selected_interest = {
                "category": "Comics & Anime",
                "interest": "Spider-Man"
            }
    def create_asset_directories(self):
        dirs = [
            os.path.join("output", "stories"),
            os.path.join("output", "images", "characters"),
            os.path.join("output", "images", "backgrounds"),
            os.path.join("output", "temp")
        ]
        for directory in dirs:
            os.makedirs(directory, exist_ok=True)

    def select_random_interest(self, interests: Dict) -> Dict[str, str]:
        """Select random category and interest from user preferences"""
        # Only select from media categories
        media_categories = ["Music Artists", "Movies/Series", "Comics & Anime"]
        available_categories = [cat for cat in media_categories if cat in interests]
        
        if not available_categories:
            return {"category": "Comics & Anime", "interest": "Spider-Man"}
        
        category = random.choice(available_categories)
        interest = random.choice(interests[category])
        return {"category": category, "interest": interest}

    def upload_to_cloudinary(self, image: Image, folder: str, public_id: str) -> str:
        sanitized_id = public_id.lower().replace(' ', '_').replace('&', 'and')
        sanitized_id = ''.join(c for c in sanitized_id if c.isalnum() or c == '_')
        
        temp_path = f"temp_{sanitized_id}.png"
        image.save(temp_path)
        
        result = cloudinary.uploader.upload(
            temp_path,
            folder=f"financial_novel/{folder}",
            public_id=sanitized_id,
            overwrite=True
        )
        
        os.remove(temp_path)
        return result['secure_url']

    def generate_story_segment(self) -> StoryData:
        topic = self.game_state.selected_concept["topic"]
        subtopic = self.game_state.selected_concept["subtopic"]
        selected_interest = self.game_state.selected_interest or {
            "category": "Comics & Anime",
            "interest": "Spider-Man"
        }
        
        prompt_template = f"""
        Generate a financial literacy story segment about {subtopic} of the {topic} as JSON with these parameters:
        - Topic : {topic}
        - Subtopic : {subtopic}
        - Difficulty: {self.game_state.difficulty}
        -If Difficulty is beginner, then assume you want to teach the concept to a kid of age 10-12 age, if it
        is intermediate, then assume you want to teach the concept to someone with age of 12-14 age and
        it is advanced, then assume you want to teach the concept to someone with age of 14-16 age.
        Based on this, the story should be designed with the intention to deliver the complete concept.
        - Interest Area: {selected_interest['category']} 
        - Character/Reference: {selected_interest['interest']}
        - Create 5 slides minimum for the complete story (Dont make it less than 5 slides, thus we will have story situation will 5 dialogues atleast)

         

        Follow this structure exactly and return valid JSON:
        {{
            "plot": {{
                "title": "The {selected_interest['interest']}'s Savings Challenge",
                "setup": "In a world of {selected_interest['category']}, {selected_interest['interest']} needs to save $1,000 for {{specific_goal}}",
                "locations": {{
                    "primary": "Main setting from {selected_interest['category']} where financial planning happens",
                    "secondary": "A place where the character faces spending temptations",
                    "tertiary": "Final location where savings goal is achieved"
                }}
            }},
            "dialogue": [
                {{
                    "character": "{selected_interest['interest']}",
                    "text": "I need to save $200 each month to reach my goal. That means cutting down my daily spending from $5 to $2.",
                    "hint": "Break down big financial goals into smaller, manageable amounts"
                }}
            ],
            "visuals": {{
                "characters": [
                    {{
                        "name": "{selected_interest['interest']}",
                        "description": "Character shown interacting with a savings tracking app/piggy bank"
                    }}
                ],
                "backgrounds": [
                    {{
                        "name": "Primary Location",
                        "description": "Main setting with financial planning elements",
                        "type": "primary"
                    }},
                    {{
                        "name": "Secondary Location",
                        "description": "Location showing spending temptations",
                        "type": "secondary"
                    }},
                    {{
                        "name": "Tertiary Location",
                        "description": "Achievement celebration setting",
                        "type": "tertiary"
                    }}
                ],
                "financial_elements": "Visual representation of the $1,000 savings goal with weekly/monthly milestones"
            }},
            "hooks": {{
                "pop_culture": "Reference to {selected_interest['category']}",
                "music": "Theme of determination and growth"
            }}
        }}
        """

        try:
            response = self.client.models.generate_content(
                model='gemini-1.5-flash',
                contents=prompt_template,
            )
            
            story_data = self._parse_response(response.text)
            validated_story = StoryData(**story_data)
            
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            self.generate_all_images_for_story(validated_story, timestamp)
            
            return validated_story
            
        except Exception as e:
            print(f"Error generating story: {e}")
            traceback.print_exc()
            return StoryData(
                plot=Plot(
                    title="Error", 
                    setup="Error generating story", 
                    locations={"primary": "Error", "secondary": "Error", "tertiary": "Error"}
                ),
                dialogue=[],
                visuals=Visuals(characters=[], backgrounds=[], financial_elements=""),
                hooks=Hooks(pop_culture="", music="")
            )


        
    def save_frontend_story(self, story_data: StoryData, story_id: str) -> str:
        """Save the frontend-formatted story JSON"""
        frontend_stories_dir = os.path.join("output", "frontend_stories")
        os.makedirs(frontend_stories_dir, exist_ok=True)
        
        frontend_story = self.format_story_for_frontend(story_data)
        frontend_filename = f"frontend_story_{story_id}.json"
        filepath = os.path.join(frontend_stories_dir, frontend_filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(frontend_story, f, indent=2)
        
        return filepath

    def generate_all_images_for_story(self, story_data: StoryData, timestamp: str) -> Dict:
        """Generate and upload all story images to Cloudinary"""
        image_paths = {
            "characters": {},
            "backgrounds": {
                "primary": None,
                "secondary": None,
                "tertiary": None
            },
        }
        
        # Generate and upload cover image
        cover_image = self.generate_story_cover(story_data)
        if cover_image:
            cover_id = f"cover_{timestamp}"
            cover_url = self.upload_to_cloudinary(cover_image, "covers", cover_id)
            image_paths["cover"] = cover_url
        
        # Generate and upload character images
        for character in story_data.visuals.characters[:5]:
            print(f"Generating image for character: {character.name}")
            character_image = self.generate_character_image(
                character.name, 
                character.description
            )
            if character_image:
                char_id = f"{character.name.lower().replace(' ', '')}{timestamp}"
                char_url = self.upload_to_cloudinary(character_image, "characters", char_id)
                image_paths["characters"][character.name] = char_url
        
        # Generate and upload background images for each type
        for bg in story_data.visuals.backgrounds:
            print(f"Generating {bg.type} background: {bg.name}")
            bg_image = self.generate_background_image(bg.name, bg.description, bg.type)
            if bg_image:
                bg_id = f"{bg.type}{bg.name.lower().replace(' ', '')}_{timestamp}"
                bg_url = self.upload_to_cloudinary(bg_image, "backgrounds", bg_id)
                image_paths["backgrounds"][bg.type] = bg_url
        
        # Update story data with image paths
        story_data.generated_images = image_paths
        return image_paths

    def generate_character_image(self, character_name: str, character_description: str) -> Optional[Image.Image]:
        """Generate a character image using Gemini"""
        selected_interest = self.game_state.selected_interest or {
            "category": "Comics & Anime",
            "interest": "Spider-Man"
        }
        prompt = f"""
        Create a character illustration with these specifications:
        - Character: {character_name}
        - Description: {character_description}
        - Style: Dynamic illustration style matching {self.game_state.selected_interest['category']}
        - Suppose if its a comic related then keep it comic style (like spiderman then simething like marvel comic), if its an anime then think of how characters are 
        made in manga/manhwa and all. if its a web series or a movie, think of generating cartoon themed portraits for them
        - No text bubbles or overlays
        - Pose: Show the character actively managing finances or saving money
        - Background: Simple, gradient background
        - Financial theme: Include subtle money-related elements like coins, savings app, or piggy bank
        - Mood: Determined and focused on financial goals
        """
        return self._generate_image(prompt, f"character{character_name}")

    def generate_background_image(self, bg_name: str, bg_description: str, bg_type: str) -> Optional[Image.Image]:
        """Generate a background image using Gemini"""
        selected_interest = self.game_state.selected_interest or {
            "category": "Comics & Anime",
            "interest": "Spider-Man"
        }

        financial_elements = {
            "primary": "savings tracking boards, financial planning tools",
            "secondary": "shopping areas, spending temptations",
            "tertiary": "achievement celebration setting with financial growth indicators"
        }

        prompt = f"""
        Create a detailed background scene with these specifications:
        - Scene: {bg_name}
        - Description: {bg_description}
        - Style: Matching {selected_interest['category']} visual style
        - Suppose if its a comic related then keep it comic style (like spiderman then something like marvel comic), if its an anime then think of how backgrounds are
        made in manga/manhwa and all. if its a web series or a movie, think of generating comic style locations based on any context of the movie/web series.
        - Setting type: {bg_type} location
        - Financial elements: Include {financial_elements[bg_type]}
        - Include specific monetary values and financial tracking visuals
        - Mood: {bg_type} scene in a financial education story
        """
        return self._generate_image(prompt, f"background{bg_type}_{bg_name}")


    def _generate_image(self, prompt: str, image_type: str) -> Optional[Image.Image]:
        """Core image generation function"""
        print(f"Generating {image_type}")

        # Use the provided prompt directly since each calling function handles its own selected_interest
        try:
            model = "gemini-2.0-flash-exp-image-generation"
            contents = [
                types.Content(
                    role="user",
                    parts=[types.Part.from_text(text=prompt)],
                ),
            ]
            generate_content_config = types.GenerateContentConfig(
                temperature=1,
                top_p=0.95,
                top_k=40,
                max_output_tokens=8192,
                response_modalities=["image", "text"],
            )

            for chunk in self.client.models.generate_content_stream(
                model=model,
                contents=contents,
                config=generate_content_config,
            ):
                if not chunk.candidates or not chunk.candidates[0].content or not chunk.candidates[0].content.parts:
                    continue

                if chunk.candidates[0].content.parts[0].inline_data:
                    inline_data = chunk.candidates[0].content.parts[0].inline_data
                    file_extension = mimetypes.guess_extension(inline_data.mime_type)
                    temp_image = Image.open(io.BytesIO(inline_data.data))
                    return temp_image

            return None

        except Exception as e:
            print(f"Error generating {image_type} image: {e}")
            traceback.print_exc()
            return None
        
    def generate_story_cover(self, story_data: StoryData) -> Optional[Image.Image]:
        """Generate a cover image for the story"""
        selected_interest = self.game_state.selected_interest or {
            "category": "Comics & Anime",
            "interest": "Spider-Man"
        }
        
        prompt = f"""
        Create a dynamic cover illustration with these specifications:
        - Style: Matching {selected_interest['category']} visual style
        - Main Focus: {story_data.plot.title}
        - Characters: {story_data.visuals.characters[0].name} working towards $1,000 savings goal
        - Setting: {story_data.plot.locations['primary']}
        - Financial Elements: Include savings tracker, milestone markers, and specific monetary values
        - Theme: Clear visualization of saving journey and financial growth
        """
        return self._generate_image(prompt, "story_cover")

    def _parse_response(self, response_text: str) -> dict:
        """Parse and validate the JSON response"""
        try:
            data = json.loads(response_text)
            return StoryData(**data).dict()
        except json.JSONDecodeError:
            cleaned = response_text.replace('json', '').replace('', '').strip()
            try:
                data = json.loads(cleaned)
                return StoryData(**data).dict()
            except:
                start_idx = cleaned.find('{')
                end_idx = cleaned.rfind('}') + 1
                if start_idx >= 0 and end_idx > start_idx:
                    json_content = cleaned[start_idx:end_idx]
                    data = json.loads(json_content)
                    return StoryData(**data).dict()
                
                return StoryData(
                    plot=Plot(
                        title="Parsing Error", 
                        setup="Error in story generation", 
                        locations={"primary": "Error", "secondary": "Error", "tertiary": "Error"}
                    ),
                    dialogue=[],
                    visuals=Visuals(characters=[], backgrounds=[], financial_elements=""),
                    hooks=Hooks(pop_culture="", music="")
                ).dict()

    def save_to_json(self, data: StoryData, filename: str) -> str:
        """Save story data to JSON"""
        output_dir = os.path.join("output", "stories")
        os.makedirs(output_dir, exist_ok=True)
        filepath = os.path.join(output_dir, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data.dict(), f, indent=2)
        return filepath

    def get_story_with_images(self, story_id: Optional[str] = None) -> Dict:
        """Get story with Cloudinary images and frontend format"""
        story_data = self._load_story(story_id)
        if isinstance(story_data, StoryData):
            return {
                "story": story_data.dict(),
                "frontend_format": self.format_story_for_frontend(story_data)
            }
        return {"error": "Story not found"}

    def update_game_state(self, new_state: Dict) -> GameState:
        """Update game state with new values and user preferences"""
        if "user_preferences" in new_state:
            self.game_state.user_preferences = UserPreferences(**new_state["user_preferences"])
            self.game_state.selected_interest = self.select_random_interest(new_state["user_preferences"])
        updated_state = self.game_state.copy(update=new_state)
        self.game_state = updated_state
        return self.game_state

    def list_available_stories(self) -> Dict:
        """List all available stories with their metadata"""
        stories_dir = os.path.join("output", "stories")
        if not os.path.exists(stories_dir):
            return {"error": "No stories directory found"}

        json_files = [f for f in os.listdir(stories_dir) if f.endswith('.json')]
        if not json_files:
            return {"error": "No stories found"}

        json_files.sort(reverse=True)
        stories = []
        
        for file in json_files:
            try:
                with open(os.path.join(stories_dir, file), 'r') as f:
                    story_data = StoryData(**json.load(f))
                    stories.append({
                        "story_id": file.replace(".json", ""),
                        "title": story_data.plot.title,
                        "concept": "savings",  # Hardcoded for now as specified
                        "interest_area": self.game_state.selected_interest["category"] if self.game_state.selected_interest else "Default",
                        "timestamp": file.split("_")[-1].replace(".json", "")
                    })
            except Exception as e:
                print(f"Error loading story {file}: {e}")
        return {"stories": stories}

    def format_story_for_frontend(self, story_data: StoryData) -> Dict:
        """Transform story data into frontend-friendly format with multiple backgrounds"""
        formatted_story = {
            "plot": story_data.plot.dict(),
            "dialogue_scenes": []
        }
        
        backgrounds = story_data.generated_images.get("backgrounds", {})
        character_images = story_data.generated_images.get("characters", {})
        
        # Map dialogue scenes to appropriate backgrounds
        total_scenes = len(story_data.dialogue)
        for i, dialogue in enumerate(story_data.dialogue):
            # Determine which background to use based on story progression
            if i < total_scenes // 3:
                background_type = "primary"
            elif i < (total_scenes * 2) // 3:
                background_type = "secondary"
            else:
                background_type = "tertiary"
                
            scene = {
                "dialogue": dialogue.dict(),
                "background_image": backgrounds.get(background_type),
                "character_image": character_images.get(dialogue.character)
            }
            formatted_story["dialogue_scenes"].append(scene)
        
        return formatted_story