from pydantic import BaseModel
from typing import List, Optional

class Episode(BaseModel):
    id: str
    course_id: str
    title: str
    summary: str
    key_points: List[str]
    transcript: str

class Course(BaseModel):
    id: str
    title: str
    subject: str
    description: str
    episode_ids: List[str]

class Question(BaseModel):
    id: str
    episode_id: str
    question_text: str
    is_anonymous: bool = True
    answer_text: Optional[str] = None

class UserProgress(BaseModel):
    user_id: str = "default"  # For MVP, using single user
    watched_episodes: List[str] = []
    completed_courses: List[str] = []
    my_list: List[str] = []  # Saved courses
    achievements: List[str] = []
    binge_streak: int = 0
    last_watch_date: Optional[str] = None

class Achievement(BaseModel):
    id: str
    name: str
    description: str
    icon: str  # Emoji or icon name
    category: str  # "director", "producer", "critic", etc.

class User(BaseModel):
    id: str
    email: str
    password: str  # In production, this should be hashed
    role: str  # "student" or "instructor"
    name: str

class LoginRequest(BaseModel):
    email: str
    password: str
    role: str  # "student" or "instructor"

class LoginResponse(BaseModel):
    token: str
    user_id: str
    role: str
    name: str


