# 🚀 LectureFlix Setup Guide

Quick setup guide to get LectureFlix running for your hackathon demo.

## Prerequisites

- **Node.js 18+** and npm
- **Python 3.9+** and pip
- **OpenAI API Key** (get one at https://platform.openai.com/api-keys)

## Step 1: Backend Setup

1. Navigate to backend:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Create `.env` file with your OpenAI API key:
```bash
# Windows PowerShell
echo "OPENAI_API_KEY=sk-your-key-here" > .env

# Linux/Mac
echo "OPENAI_API_KEY=sk-your-key-here" > .env
```

4. Start the backend server:
```bash
python main.py
```

✅ Backend should be running at `http://localhost:8000`

## Step 2: Frontend Setup

1. Open a **new terminal** and navigate to frontend:
```bash
cd frontend
```

2. Install Node dependencies:
```bash
npm install
```

3. Start the frontend server:
```bash
npm run dev
```

✅ Frontend should be running at `http://localhost:3000`

## Step 3: Test It Out!

1. Open `http://localhost:3000` in your browser
2. You should see the Netflix-style homepage with preloaded courses
3. Click on a course to see episodes
4. Click on an episode to try:
   - AI Tutor (WhisperChat)
   - Anonymous Q&A
5. Go to Upload page to test the AI pipeline

## 🎯 Demo Script

1. **Show Homepage** - "Netflix-style interface with subjects"
2. **Browse Course** - "Click into Machine Learning 101"
3. **View Episode** - "See episode details, key points"
4. **Ask AI Tutor** - "Type: 'Explain this like I'm 12'"
5. **Submit Anonymous Question** - "Show how introverted students can ask safely"
6. **Instructor Dashboard** - "Show how instructors answer questions"
7. **Upload Lecture** - "Upload a short audio file, watch AI generate episodes"

## ⚠️ Troubleshooting

### Backend won't start
- Make sure Python 3.9+ is installed
- Check that all dependencies are installed: `pip install -r requirements.txt`
- Verify `.env` file exists with `OPENAI_API_KEY`

### Frontend won't start
- Make sure Node.js 18+ is installed: `node --version`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check if port 3000 is available

### API errors
- Make sure backend is running on port 8000
- Check browser console for CORS errors
- Verify OpenAI API key is valid and has credits

### OpenAI API errors
- Make sure your API key is correct
- Check you have credits in your OpenAI account
- For Whisper API, ensure your account has access

## 💡 Tips for Hackathon

- **Pre-upload some content** - Use the upload feature before the demo to have more courses
- **Test the flow** - Run through the entire demo once before presenting
- **Have backup** - If OpenAI API fails, the preloaded content still works
- **Highlight features** - Emphasize the anonymous Q&A and AI tutor during pitch

## 🎬 Ready to Present!

Your LectureFlix prototype is ready. Good luck with your hackathon! 🚀


