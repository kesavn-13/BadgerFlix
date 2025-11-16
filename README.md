# BadgerFlix

A Netflix-style learning platform that transforms long lectures into bingeable episodes with AI-powered study tools.

## Overview

BadgerFlix converts audio/video lectures into structured, episode-based courses. Students can learn at their own pace with AI-generated flashcards, quizzes, and interactive tutoring.

## Features

- **Episode Generation**: Automatically breaks lectures into 4-6 digestible episodes
- **AI Tutor**: Real-time Q&A based on episode content
- **Study Tools**: Auto-generated flashcards, quizzes, and presentation slides
- **Progress Tracking**: Movie-themed achievements and learning streaks
- **Netflix-Style UI**: Familiar, engaging interface for content consumption

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: FastAPI, Python 3.11+
- **AI**: Google Gemini 2.5 Flash
- **Storage**: In-memory (production-ready database integration available)

## Getting Started

### Prerequisites

- Node.js 18 or higher
- Python 3.11 or higher
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. Clone the repository:
```bash
git clone https://github.com/kesavn-13/BadgerFlix.git
cd BadgerFlix
```

2. Set up the backend:
```bash
cd backend
pip install -r requirements.txt
```

3. Configure environment variables:
```bash
# Create .env file in backend directory
echo "GEMINI_API_KEY=your_api_key_here" > .env
```

4. Start the backend server:
```bash
python main.py
# Server runs on http://localhost:8000
```

5. Set up the frontend (in a new terminal):
```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:3000
```

### Default Credentials

- **Student**: `student@lectureflix.com` / `student123`
- **Instructor**: `instructor@lectureflix.com` / `instructor123`

## Project Structure

```
BadgerFlix/
├── backend/
│   ├── main.py          # FastAPI application
│   ├── ai.py            # Gemini AI integration
│   ├── models.py        # Data models
│   └── storage.py       # In-memory data storage
├── frontend/
│   ├── app/             # Next.js app directory
│   │   ├── page.tsx     # Homepage
│   │   ├── login/       # Authentication
│   │   ├── student/     # Student dashboard
│   │   └── episode/     # Episode pages
│   └── lib/
│       └── api.ts       # API client
└── README.md
```

## API Endpoints

- `GET /subjects` - List all course subjects
- `GET /subject/{subject}/courses` - Get courses by subject
- `GET /course/{id}` - Get course details
- `GET /episode/{id}` - Get episode content
- `POST /upload-lecture` - Upload and process lecture file
- `POST /episode/{id}/ask-ai` - Query AI tutor
- `POST /episode/{id}/flashcards` - Generate flashcards
- `POST /episode/{id}/quiz` - Generate quiz
- `POST /episode/{id}/slides` - Generate slides

Full API documentation available at `http://localhost:8000/docs` when the backend is running.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment instructions.

Recommended platforms:
- **Frontend**: Vercel
- **Backend**: Railway or Render

## Development

### Backend Development

```bash
cd backend
uvicorn main:app --reload
```

### Frontend Development

```bash
cd frontend
npm run dev
```

## License

MIT License
