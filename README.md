# 🎬 BadgerFlix

**Netflix for University Lectures** - Transform long lectures into bingeable episodes with AI-powered learning tools.

## 🚀 Features

- **AI-Generated Episodes** - Upload audio/video lectures, AI breaks them into Netflix-style episodes
- **AI Tutor (WhisperChat)** - Ask questions and get instant AI-powered explanations
- **Study Tools** - Generate flashcards, quizzes, and presentation slides
- **Progress Tracking** - Track your learning with movie-themed achievements
- **Netflix-Style UI** - Beautiful, cinematic interface for binge-learning

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **Backend:** FastAPI, Python
- **AI:** Google Gemini 2.5 Flash
- **Storage:** In-memory (can be upgraded to database)

## 📦 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Gemini API Key

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
# Create .env file with: GEMINI_API_KEY=your_key_here
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:3000

## 🔐 Demo Credentials

- **Student:** student@lectureflix.com / student123
- **Instructor:** instructor@lectureflix.com / instructor123

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT.md)
- [Step-by-Step Deployment](./DEPLOYMENT_STEPS.md)

## 🚀 Deploy

See [DEPLOYMENT_STEPS.md](./DEPLOYMENT_STEPS.md) for detailed deployment instructions.

**Recommended:**
- Frontend: Vercel (free)
- Backend: Railway or Render (free tier)

## 📝 License

MIT

---

Built with ❤️ for education
