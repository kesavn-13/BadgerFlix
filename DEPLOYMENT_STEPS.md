# 🚀 BadgerFlix Deployment Steps for kesavn-13

## Prerequisites
- GitHub account: kesavn-13
- Gemini API Key (you already have this)
- Vercel account (free) - https://vercel.com
- Railway account (free tier) - https://railway.app

---

## Step 1: Push Code to GitHub

### If you haven't initialized git yet:
```powershell
cd "C:\Users\Patron\Desktop\Netlix for education"
git init
git add .
git commit -m "Initial commit - BadgerFlix"
git branch -M main
git remote add origin https://github.com/kesavn-13/badgerflix.git
git push -u origin main
```

### If repository already exists:
```powershell
git add .
git commit -m "BadgerFlix - Ready for deployment"
git push
```

---

## Step 2: Deploy Backend to Railway

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Authorize Railway to access your GitHub
5. Select repository: `kesavn-13/badgerflix` (or create it first)
6. Railway will detect it's a Python project
7. **Important Settings:**
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
8. Go to "Variables" tab and add:
   - `GEMINI_API_KEY` = Your Gemini API key
9. Railway will give you a URL like: `https://badgerflix-production.up.railway.app`
10. **Copy this URL** - you'll need it for frontend!

---

## Step 3: Update Backend CORS

After you get your Railway backend URL, update `backend/main.py`:

```python
allow_origins=[
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://your-frontend.vercel.app",  # Add your Vercel URL here
],
```

Then commit and push:
```powershell
git add backend/main.py
git commit -m "Update CORS for production"
git push
```

Railway will auto-redeploy.

---

## Step 4: Deploy Frontend to Vercel

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository: `kesavn-13/badgerflix`
4. **Configure Project:**
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `frontend`
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
5. **Environment Variables:**
   - Add: `NEXT_PUBLIC_API_URL` = Your Railway backend URL (from Step 2)
6. Click "Deploy"
7. Vercel will give you a URL like: `https://badgerflix.vercel.app`

---

## Step 5: Update Backend CORS with Frontend URL

1. Go back to Railway
2. Update the CORS in `backend/main.py` with your Vercel URL
3. Commit and push
4. Railway will redeploy

---

## Step 6: Test Your Deployment

1. Visit your Vercel frontend URL
2. You should see the login page
3. Login with demo credentials:
   - Student: `student@lectureflix.com` / `student123`
   - Instructor: `instructor@lectureflix.com` / `instructor123`
4. Test uploading a lecture
5. Test all features!

---

## Troubleshooting

### Backend not connecting?
- Check Railway logs
- Verify `GEMINI_API_KEY` is set
- Check CORS settings

### Frontend can't reach backend?
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check backend CORS includes frontend URL
- Check Railway backend is running (check logs)

### 404 errors?
- Make sure root directories are set correctly
- Frontend: `frontend`
- Backend: `backend`

---

## Quick Commands Reference

```powershell
# Check git status
git status

# Add all changes
git add .

# Commit
git commit -m "Your message"

# Push to GitHub
git push

# Check if backend is running locally
curl http://localhost:8000
```

---

## Need Help?

If you encounter issues:
1. Check Railway logs (backend)
2. Check Vercel logs (frontend)
3. Verify environment variables are set
4. Check CORS settings match your frontend URL

Good luck with deployment! 🚀

