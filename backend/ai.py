import json
import os
from dotenv import load_dotenv
import google.generativeai as genai
import google.generativeai.types as genai_types
import time

# Load environment variables - explicitly load from backend directory
backend_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(backend_dir, '.env')

# Try multiple ways to load the .env file
if os.path.exists(env_path):
    load_dotenv(env_path, override=True)
    print(f"[ENV] Loaded .env from: {env_path}")
else:
    print(f"[ENV] .env not found at: {env_path}, trying current directory")
    load_dotenv(override=True)

# Also try loading from current directory as fallback
load_dotenv(override=True)

# Initialize Gemini client
gemini_key = os.getenv("GEMINI_API_KEY")

# If still not found, try reading directly from .env file
if not gemini_key and os.path.exists(env_path):
    try:
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and 'GEMINI_API_KEY' in line:
                    if '=' in line:
                        gemini_key = line.split('=', 1)[1].strip().strip('"').strip("'").strip()
                        if gemini_key:
                            print("[ENV] Loaded GEMINI_API_KEY directly from .env file")
                            # Set it in environment for future use
                            os.environ['GEMINI_API_KEY'] = gemini_key
                            break
    except Exception as e:
        print(f"[ENV] Error reading .env directly: {e}")

if not gemini_key or len(gemini_key) < 10:
    raise ValueError(f"GEMINI_API_KEY not found in environment variables. Please set it in .env file. Current value: {gemini_key[:10] if gemini_key else 'None'}...")

# Configure Gemini
genai.configure(api_key=gemini_key)

# Use the working model name (tested and confirmed)
model_name = 'gemini-2.5-flash-preview-05-20'
model = genai.GenerativeModel(model_name)

# Safety settings - disable all blocking for demo/educational purposes
import google.generativeai.types as genai_types

SAFETY_SETTINGS = [
    {
        "category": genai_types.HarmCategory.HARM_CATEGORY_HARASSMENT,
        "threshold": genai_types.HarmBlockThreshold.BLOCK_NONE
    },
    {
        "category": genai_types.HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        "threshold": genai_types.HarmBlockThreshold.BLOCK_NONE
    },
    {
        "category": genai_types.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        "threshold": genai_types.HarmBlockThreshold.BLOCK_NONE
    },
    {
        "category": genai_types.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        "threshold": genai_types.HarmBlockThreshold.BLOCK_NONE
    },
]

print(f"[GEMINI] Using Gemini API for all AI operations (Model: {model_name}, Key: {gemini_key[:20]}...)")
print(f"[GEMINI] Safety filters disabled for demo purposes")

def transcribe_audio(file_path: str) -> str:
    """Transcribe audio file using Gemini 1.5 (supports audio directly)"""
    try:
        # Upload audio file to Gemini
        audio_file = genai.upload_file(path=file_path)
        
        # Wait for file to be processed
        while audio_file.state.name == "PROCESSING":
            time.sleep(2)
            audio_file = genai.get_file(audio_file.name)
        
        if audio_file.state.name == "FAILED":
            raise Exception("File processing failed")
        
        # Generate transcript with safety settings disabled
        response = model.generate_content(
            [
                "Transcribe this audio file word-for-word. Return only the transcript text, no additional commentary, no timestamps, just the spoken words.",
                audio_file
            ],
            safety_settings=SAFETY_SETTINGS
        )
        
        # Handle response format
        if hasattr(response, 'text') and response.text:
            transcript = response.text.strip()
        elif hasattr(response, 'candidates') and response.candidates:
            text_parts = []
            for candidate in response.candidates:
                if hasattr(candidate, 'content') and hasattr(candidate.content, 'parts'):
                    for part in candidate.content.parts:
                        if hasattr(part, 'text'):
                            text_parts.append(part.text)
            transcript = ' '.join(text_parts).strip() if text_parts else str(response)
        else:
            transcript = str(response).strip()
        
        # Clean up uploaded file
        try:
            genai.delete_file(audio_file.name)
        except:
            pass  # Ignore cleanup errors
        
        return transcript
    except Exception as e:
        error_msg = str(e)
        print(f"Transcription error: {error_msg}")
        
        # Check for quota/credit issues
        if "quota" in error_msg.lower() or "429" in error_msg or "rate limit" in error_msg.lower():
            raise Exception("API quota or rate limit exceeded. Please check your Gemini API credits or try again later.")
        
        # Check for API key issues
        if "api key" in error_msg.lower() or "authentication" in error_msg.lower() or "401" in error_msg or "403" in error_msg:
            raise Exception("API authentication failed. Please check your Gemini API key.")
        
        raise Exception(f"Transcription failed: {error_msg}")

def generate_episodes_from_transcript(transcript: str, course_title: str) -> list:
    """Break transcript into Netflix-style episodes using Gemini"""
    # Add generation config for faster responses
    
    generation_config = {
        "temperature": 0.7,
        "top_p": 0.8,
        "top_k": 40,
        "max_output_tokens": 8192,
    }
    
    # Truncate transcript to avoid token limits
    transcript_snippet = transcript[:8000] if len(transcript) > 8000 else transcript
    
    prompt = f"""You are an educational content creator. Break this lecture transcript into 4-6 educational episodes.

Return a JSON array with this exact structure:
[
  {{
    "title": "Episode 1: [Topic Name]",
    "summary": "Brief 2-3 sentence summary",
    "key_points": ["Key point 1", "Key point 2", "Key point 3"],
    "transcript": "Relevant transcript excerpt for this episode (300-500 words from the original)"
  }}
]

Course: {course_title}

Transcript:
{transcript_snippet}

Requirements:
- Create 4-6 episodes
- Each episode should cover a distinct topic
- Extract actual transcript text (300-500 words per episode)
- Return ONLY valid JSON, no markdown, no explanations
"""

    try:
        response = model.generate_content(
            prompt, 
            generation_config=generation_config,
            safety_settings=SAFETY_SETTINGS
        )
        
        # Handle different response formats from Gemini
        content = None
        
        # Check for finish_reason issues
        if hasattr(response, 'candidates') and response.candidates:
            for candidate in response.candidates:
                if hasattr(candidate, 'finish_reason'):
                    finish_reason = candidate.finish_reason
                    if finish_reason == 2:  # SAFETY (blocked)
                        raise Exception("Content was blocked by safety filters. Please try with different content or adjust the prompt.")
                    elif finish_reason == 3:  # RECITATION (copyright)
                        raise Exception("Content was blocked due to potential copyright issues.")
                    elif finish_reason == 4:  # OTHER
                        raise Exception("Content generation was stopped for an unknown reason.")
                
                # Try to extract text from candidate
                if hasattr(candidate, 'content') and hasattr(candidate.content, 'parts'):
                    for part in candidate.content.parts:
                        if hasattr(part, 'text') and part.text:
                            if content is None:
                                content = part.text
                            else:
                                content += ' ' + part.text
        
        # Fallback to response.text if available
        if not content and hasattr(response, 'text') and response.text:
            content = response.text.strip()
        
        # Fallback to direct parts access
        if not content and hasattr(response, 'parts'):
            text_parts = []
            for part in response.parts:
                if hasattr(part, 'text') and part.text:
                    text_parts.append(part.text)
            if text_parts:
                content = ' '.join(text_parts).strip()
        
        if not content:
            # Check if there's any error information
            error_msg = "No text content in response"
            if hasattr(response, 'candidates') and response.candidates:
                for candidate in response.candidates:
                    if hasattr(candidate, 'finish_reason'):
                        error_msg += f" (finish_reason: {candidate.finish_reason})"
                    if hasattr(candidate, 'safety_ratings'):
                        error_msg += f" (safety_ratings: {candidate.safety_ratings})"
            raise Exception(error_msg)
            
    except Exception as e:
        error_msg = str(e)
        print(f"Error generating episodes: {error_msg}")
        
        # Check for quota/credit issues
        if "quota" in error_msg.lower() or "429" in error_msg or "rate limit" in error_msg.lower():
            raise Exception("API quota or rate limit exceeded. Please check your Gemini API credits or try again later.")
        
        # Check for API key issues
        if "api key" in error_msg.lower() or "authentication" in error_msg.lower() or "401" in error_msg or "403" in error_msg:
            raise Exception("API authentication failed. Please check your Gemini API key.")
        
        # If it's a safety/content issue (shouldn't happen with BLOCK_NONE, but just in case)
        if "blocked" in error_msg.lower() or "safety" in error_msg.lower() or "finish_reason" in error_msg.lower():
            raise Exception(f"Content generation was blocked. Error: {error_msg}")
        
        raise Exception(f"Error generating episodes: {error_msg}")
    
    # Try to extract JSON if wrapped in markdown code blocks
    if content.startswith("```"):
        content = content.split("```")[1]
        if content.startswith("json"):
            content = content[4:]
        content = content.strip()
    
    try:
        episodes = json.loads(content)
        return episodes
    except json.JSONDecodeError:
        # Fallback: try to find JSON array in the response
        import re
        json_match = re.search(r'\[.*\]', content, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        # If all else fails, create a single episode
        return [{
            "title": f"{course_title} - Episode 1",
            "summary": "AI-generated episode from lecture transcript",
            "key_points": ["Key concept 1", "Key concept 2"],
            "transcript": transcript[:1000] if len(transcript) > 1000 else transcript
        }]

def ask_ai_tutor(episode: dict, question: str) -> str:
    """Generate AI tutor response based on episode content using Gemini"""
    try:
        transcript_text = episode.get('transcript', '')
        if len(transcript_text) < 100:
            transcript_text = f"{episode.get('summary', '')} {', '.join(episode.get('key_points', []))}"
        
        prompt = f"""
You are a friendly AI tutor helping a student understand this episode.

Episode Title: {episode.get('title', 'Unknown')}
Episode Summary: {episode.get('summary', '')}
Key Points: {', '.join(episode.get('key_points', []))}
Transcript: {transcript_text[:2000]}

Student Question: {question}

Provide a clear, helpful, and encouraging answer. Use examples when possible.
Keep it conversational and educational. Only answer based on the episode content above.
If the question is not related to the episode content, politely redirect the student to ask about the episode.
"""

        # Add generation config for faster responses
        generation_config = {
            "temperature": 0.7,
            "top_p": 0.8,
            "top_k": 40,
            "max_output_tokens": 1024,
        }
        
        response = model.generate_content(
            prompt,
            generation_config=generation_config,
            safety_settings=SAFETY_SETTINGS
        )
        
        # Handle different response formats from Gemini
        if hasattr(response, 'text') and response.text:
            return response.text.strip()
        elif hasattr(response, 'candidates') and response.candidates:
            # Extract text from candidates
            text_parts = []
            for candidate in response.candidates:
                if hasattr(candidate, 'content') and hasattr(candidate.content, 'parts'):
                    for part in candidate.content.parts:
                        if hasattr(part, 'text'):
                            text_parts.append(part.text)
            if text_parts:
                return ' '.join(text_parts).strip()
        elif hasattr(response, 'parts'):
            # Direct parts access
            text_parts = []
            for part in response.parts:
                if hasattr(part, 'text'):
                    text_parts.append(part.text)
            if text_parts:
                return ' '.join(text_parts).strip()
        
        # Fallback: try to get string representation
        return str(response).strip()
    except Exception as e:
        print(f"Error in ask_ai_tutor: {str(e)}")
        error_msg = str(e)
        if "timeout" in error_msg.lower() or "429" in error_msg:
            return "The AI service is currently busy. Please try again in a moment."
        return f"I apologize, but I encountered an error while processing your question. Please try again. Error: {error_msg[:100]}"

def generate_flashcards(episode: dict) -> list:
    """Generate flashcards for an episode using Gemini"""
    try:
        transcript_text = episode.get('transcript', '')
        if len(transcript_text) < 100:
            transcript_text = f"{episode.get('summary', '')} {', '.join(episode.get('key_points', []))}"
        
        prompt = f"""
You are creating study flashcards for this episode.

Episode Title: {episode.get('title', 'Unknown')}
Episode Summary: {episode.get('summary', '')}
Key Points: {', '.join(episode.get('key_points', []))}
Transcript: {transcript_text[:2000]}

Create 8-10 concise flashcards that help students study this episode.
Return ONLY a valid JSON array in this exact format:
[
  {{
    "front": "Question or term?",
    "back": "Answer or explanation."
  }},
  {{
    "front": "Another question?",
    "back": "Another answer."
  }}
]

Return ONLY the JSON array, no other text.
"""

        # Use optimized generation config for faster responses
        generation_config = {
            "temperature": 0.7,
            "top_p": 0.8,
            "top_k": 40,
            "max_output_tokens": 2048,
        }
        
        response = model.generate_content(prompt, generation_config=generation_config)
        
        # Handle different response formats
        if hasattr(response, 'text') and response.text:
            content = response.text.strip()
        elif hasattr(response, 'candidates') and response.candidates:
            text_parts = []
            for candidate in response.candidates:
                if hasattr(candidate, 'content') and hasattr(candidate.content, 'parts'):
                    for part in candidate.content.parts:
                        if hasattr(part, 'text'):
                            text_parts.append(part.text)
            content = ' '.join(text_parts).strip() if text_parts else str(response)
        else:
            content = str(response).strip()
        
        # Extract JSON if wrapped in markdown
        if content.startswith("```"):
            parts = content.split("```")
            if len(parts) > 1:
                content = parts[1]
                if content.startswith("json"):
                    content = content[4:]
            content = content.strip()
        
        try:
            flashcards = json.loads(content)
            if isinstance(flashcards, list) and len(flashcards) > 0:
                return flashcards
        except json.JSONDecodeError:
            import re
            json_match = re.search(r'\[.*\]', content, re.DOTALL)
            if json_match:
                flashcards = json.loads(json_match.group())
                if isinstance(flashcards, list) and len(flashcards) > 0:
                    return flashcards
        
        # Fallback
        return [
            {"front": "What is the main topic of this episode?", "back": episode.get('summary', 'N/A')},
            {"front": episode.get('key_points', [])[0] if episode.get('key_points') else "Key concept?", "back": episode.get('summary', 'N/A')}
        ]
    except Exception as e:
        print(f"Error generating flashcards: {str(e)}")
        # Return fallback flashcards
        return [
            {"front": "What is the main topic?", "back": episode.get('summary', 'N/A')},
            {"front": "Key concept?", "back": episode.get('key_points', [])[0] if episode.get('key_points') else 'N/A'}
        ]

def generate_quiz(episode: dict) -> list:
    """Generate quiz questions for an episode using Gemini"""
    try:
        transcript_text = episode.get('transcript', '')
        if len(transcript_text) < 100:
            transcript_text = f"{episode.get('summary', '')} {', '.join(episode.get('key_points', []))}"
        
        prompt = f"""
You are creating a quiz for this episode.

Episode Title: {episode.get('title', 'Unknown')}
Episode Summary: {episode.get('summary', '')}
Key Points: {', '.join(episode.get('key_points', []))}
Transcript: {transcript_text[:2000]}

Create 5 multiple choice questions that test understanding of this episode.
Return ONLY a valid JSON array in this exact format:
[
  {{
    "question": "What is the main concept?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_index": 0,
    "explanation": "Why this is the correct answer."
  }},
  {{
    "question": "Another question?",
    "options": ["A", "B", "C", "D"],
    "correct_index": 2,
    "explanation": "Explanation here."
  }}
]

Return ONLY the JSON array, no other text.
"""

        # Use optimized generation config for faster responses
        generation_config = {
            "temperature": 0.7,
            "top_p": 0.8,
            "top_k": 40,
            "max_output_tokens": 2048,
        }
        
        response = model.generate_content(prompt, generation_config=generation_config)
        
        # Handle different response formats
        if hasattr(response, 'text') and response.text:
            content = response.text.strip()
        elif hasattr(response, 'candidates') and response.candidates:
            text_parts = []
            for candidate in response.candidates:
                if hasattr(candidate, 'content') and hasattr(candidate.content, 'parts'):
                    for part in candidate.content.parts:
                        if hasattr(part, 'text'):
                            text_parts.append(part.text)
            content = ' '.join(text_parts).strip() if text_parts else str(response)
        else:
            content = str(response).strip()
        
        # Extract JSON if wrapped in markdown
        if content.startswith("```"):
            parts = content.split("```")
            if len(parts) > 1:
                content = parts[1]
                if content.startswith("json"):
                    content = content[4:]
            content = content.strip()
        
        try:
            quiz = json.loads(content)
            if isinstance(quiz, list) and len(quiz) > 0:
                return quiz
        except json.JSONDecodeError:
            import re
            json_match = re.search(r'\[.*\]', content, re.DOTALL)
            if json_match:
                quiz = json.loads(json_match.group())
                if isinstance(quiz, list) and len(quiz) > 0:
                    return quiz
        
        # Fallback
        return [{
            "question": "What is the main topic of this episode?",
            "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
            "correct_index": 0,
            "explanation": "Based on the episode summary."
        }]
    except Exception as e:
        print(f"Error generating quiz: {str(e)}")
        return [{
            "question": "What is the main topic of this episode?",
            "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
            "correct_index": 0,
            "explanation": "Based on the episode summary."
        }]

def generate_slides(episode: dict) -> list:
    """Generate presentation slides for an episode using Gemini"""
    try:
        transcript_text = episode.get('transcript', '')
        if len(transcript_text) < 100:
            transcript_text = f"{episode.get('summary', '')} {', '.join(episode.get('key_points', []))}"
        
        prompt = f"""
You are creating a presentation slide deck for this episode.

Episode Title: {episode.get('title', 'Unknown')}
Episode Summary: {episode.get('summary', '')}
Key Points: {', '.join(episode.get('key_points', []))}
Transcript: {transcript_text[:2000]}

Create 6-8 presentation slides that teach this episode content.
Return ONLY a valid JSON array in this exact format:
[
  {{
    "title": "Slide Title",
    "bullets": ["Point 1", "Point 2", "Point 3"]
  }},
  {{
    "title": "Next Slide Title",
    "bullets": ["Point A", "Point B"]
  }}
]

Return ONLY the JSON array, no other text.
"""

        # Use optimized generation config for faster responses
        generation_config = {
            "temperature": 0.7,
            "top_p": 0.8,
            "top_k": 40,
            "max_output_tokens": 2048,
        }
        
        response = model.generate_content(prompt, generation_config=generation_config)
        
        # Handle different response formats
        if hasattr(response, 'text') and response.text:
            content = response.text.strip()
        elif hasattr(response, 'candidates') and response.candidates:
            text_parts = []
            for candidate in response.candidates:
                if hasattr(candidate, 'content') and hasattr(candidate.content, 'parts'):
                    for part in candidate.content.parts:
                        if hasattr(part, 'text'):
                            text_parts.append(part.text)
            content = ' '.join(text_parts).strip() if text_parts else str(response)
        else:
            content = str(response).strip()
        
        # Extract JSON if wrapped in markdown
        if content.startswith("```"):
            parts = content.split("```")
            if len(parts) > 1:
                content = parts[1]
                if content.startswith("json"):
                    content = content[4:]
            content = content.strip()
        
        try:
            slides = json.loads(content)
            if isinstance(slides, list) and len(slides) > 0:
                return slides
        except json.JSONDecodeError:
            import re
            json_match = re.search(r'\[.*\]', content, re.DOTALL)
            if json_match:
                slides = json.loads(json_match.group())
                if isinstance(slides, list) and len(slides) > 0:
                    return slides
        
        # Fallback
        return [
            {"title": episode.get('title', 'Episode'), "bullets": episode.get('key_points', [])}
        ]
    except Exception as e:
        print(f"Error generating slides: {str(e)}")
        return [
            {"title": episode.get('title', 'Episode'), "bullets": episode.get('key_points', [])}
        ]
