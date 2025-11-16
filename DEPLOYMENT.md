# 🚀 BadgerFlix Deployment Guide

## Deployment Options

### Option 1: Vercel (Frontend) + Railway/Render (Backend) - RECOMMENDED

#### Frontend (Vercel - Free)
1. Push your code to GitHub
2. Go to https://vercel.com
3. Import your repository
4. Set root directory to `frontend`
5. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = Your backend URL (e.g., `https://your-backend.railway.app`)
6. Deploy!

#### Backend (Railway - Free tier available)
1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select your repository
4. Set root directory to `backend`
5. Add environment variables:
   - `GEMINI_API_KEY` = Your Gemini API key
6. Railway will auto-detect Python and install dependencies
7. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

#### Backend (Render - Alternative)
1. Go to https://render.com
2. New Web Service → Connect GitHub
3. Set:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variable: `GEMINI_API_KEY`
5. Deploy!

### Option 2: Netlify (Frontend) + Fly.io (Backend)

#### Frontend (Netlify)
1. Build command: `cd frontend && npm run build`
2. Publish directory: `frontend/.next`
3. Add environment variable: `NEXT_PUBLIC_API_URL`

#### Backend (Fly.io)
1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. `fly launch` in backend directory
3. Add secrets: `fly secrets set GEMINI_API_KEY=your_key`

### Option 3: Full Stack on Vercel (Experimental)

Vercel supports Python, but for production, separate frontend/backend is recommended.

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

### Backend (.env)
```
GEMINI_API_KEY=your_gemini_api_key
```

## Post-Deployment Checklist

- [ ] Update CORS in backend to allow your frontend domain
- [ ] Test login functionality
- [ ] Test upload functionality
- [ ] Verify API endpoints are accessible
- [ ] Check environment variables are set correctly

## CORS Update for Production

Update `backend/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://your-frontend.vercel.app",  # Add your production URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

