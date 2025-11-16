from models import Course, Episode, Question, UserProgress, Achievement, User
from typing import Dict

# In-memory storage (can be replaced with database later)
courses: Dict[str, Course] = {}
episodes: Dict[str, Episode] = {}
questions: Dict[str, Question] = {}

# Simple user storage (in production, use a database)
users: Dict[str, User] = {}
# Default users for demo
users["student@lectureflix.com"] = User(
    id="student1",
    email="student@lectureflix.com",
    password="student123",  # In production, hash this
    role="student",
    name="Student User"
)
users["instructor@lectureflix.com"] = User(
    id="instructor1",
    email="instructor@lectureflix.com",
    password="instructor123",  # In production, hash this
    role="instructor",
    name="Instructor User"
)

# Active sessions (token -> user_id mapping)
sessions: Dict[str, str] = {}

# Progress tracking (single user for MVP)
user_progress: UserProgress = UserProgress()

# Achievement definitions
achievements: Dict[str, Achievement] = {
    "director": Achievement(
        id="director",
        name="Director",
        description="Completed a full course",
        icon="🎬",
        category="completion"
    ),
    "producer": Achievement(
        id="producer",
        name="Producer",
        description="Created/uploaded content",
        icon="🎥",
        category="creation"
    ),
    "critic": Achievement(
        id="critic",
        name="Critic",
        description="Rated multiple episodes",
        icon="⭐",
        category="engagement"
    ),
    "action_hero": Achievement(
        id="action_hero",
        name="Action Hero",
        description="Completed a quiz perfectly",
        icon="💪",
        category="quiz"
    ),
    "screenwriter": Achievement(
        id="screenwriter",
        name="Screenwriter",
        description="Asked great questions",
        icon="✍️",
        category="engagement"
    ),
    "cinematographer": Achievement(
        id="cinematographer",
        name="Cinematographer",
        description="Watched all episodes in a course",
        icon="📹",
        category="completion"
    ),
    "binge_watcher": Achievement(
        id="binge_watcher",
        name="Binge Watcher",
        description="Completed multiple courses in a day",
        icon="📺",
        category="streak"
    ),
    "binge_master": Achievement(
        id="binge_master",
        name="Binge Master",
        description="7-day learning streak",
        icon="🏆",
        category="streak"
    ),
}


