# Deployment Guide

## Overview

BadgerFlix requires separate deployments for frontend and backend services.

## Frontend Deployment (Vercel)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Configure:
   - **Root Directory**: `frontend`
   - **Framework**: Next.js (auto-detected)
   - **Environment Variable**: `NEXT_PUBLIC_API_URL` = your backend URL
5. Deploy

## Backend Deployment (Railway)

1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select your repository
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Environment Variable**: `GEMINI_API_KEY` = your API key
5. Copy the generated URL
6. Update frontend `NEXT_PUBLIC_API_URL` with this URL

## Backend Deployment (Render - Alternative)

1. Go to [render.com](https://render.com)
2. New Web Service → Connect GitHub
3. Configure:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Environment Variable**: `GEMINI_API_KEY`
4. Deploy

## CORS Configuration

After deployment, update `backend/main.py` CORS settings to include your frontend URL:

```python
allow_origins=[
    "http://localhost:3000",
    "https://your-frontend.vercel.app",
]
```

Commit and push - Railway/Render will auto-redeploy.

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

### Backend (.env)
```
GEMINI_API_KEY=your_gemini_api_key
```
