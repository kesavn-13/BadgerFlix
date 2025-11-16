# 🔧 Troubleshooting Guide - Website Not Working

## Quick Diagnosis

### Step 1: Check if Backend is Running

Open a new PowerShell terminal and run:
```powershell
cd "C:\Users\Patron\Desktop\Netlix for education\backend"
python main.py
```

**Expected**: You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**If you see errors:**
- `ModuleNotFoundError`: Run `pip install -r requirements.txt`
- `OPENAI_API_KEY not found`: Create `.env` file in backend folder with `OPENAI_API_KEY=your_key_here`

### Step 2: Check if Frontend is Running

Open a **NEW** PowerShell terminal and run:
```powershell
cd "C:\Users\Patron\Desktop\Netlix for education\frontend"
npm install
npm run dev
```

**Expected**: You should see:
```
✓ Ready in X seconds
○ Local: http://localhost:3000
```

**If you see errors:**
- `'npm' is not recognized`: Install Node.js from nodejs.org
- `Port 3000 already in use`: Change port or close the app using it

### Step 3: Test Backend API

Open browser and go to: `http://localhost:8000`

**Expected**: You should see:
```json
{"message": "LectureFlix API", "status": "running"}
```

If this doesn't work, backend is not running correctly.

### Step 4: Test Frontend

Open browser and go to: `http://localhost:3000`

**Expected**: Netflix-style homepage with courses

**If you see:**
- **Blank page**: Open browser console (F12) and check for errors
- **"Loading..." forever**: Backend is not running or CORS issue
- **Network errors**: Check if backend is on port 8000

## Common Errors & Fixes

### Error 1: "Cannot GET /"
**Cause**: Frontend not running or wrong URL
**Fix**: Make sure you're going to `http://localhost:3000` (not 8000)

### Error 2: "Network Error" or "Failed to fetch"
**Cause**: Backend not running or CORS issue
**Fix**: 
1. Make sure backend is running on port 8000
2. Check `backend/main.py` line 19 - should have `"http://localhost:3000"` in CORS origins

### Error 3: "OPENAI_API_KEY environment variable not found"
**Cause**: Missing .env file
**Fix**: 
```powershell
cd "C:\Users\Patron\Desktop\Netlix for education\backend"
echo "OPENAI_API_KEY=sk-your-key-here" > .env
```

### Error 4: "Module 'openai' not found"
**Cause**: Python dependencies not installed
**Fix**:
```powershell
cd "C:\Users\Patron\Desktop\Netlix for education\backend"
pip install -r requirements.txt
```

### Error 5: "Cannot find module 'next'"
**Cause**: Node dependencies not installed
**Fix**:
```powershell
cd "C:\Users\Patron\Desktop\Netlix for education\frontend"
npm install
```

### Error 6: Port Already in Use
**Cause**: Another app is using port 3000 or 8000
**Fix**:
- For backend: Change port in `backend/main.py` (line 322) to `port=8001`
- For frontend: Run `npm run dev -- -p 3001`

## Step-by-Step Setup (If Nothing Works)

### Complete Fresh Start:

1. **Backend Setup**:
```powershell
# Terminal 1
cd "C:\Users\Patron\Desktop\Netlix for education\backend"
pip install fastapi uvicorn python-multipart openai pydantic
echo "OPENAI_API_KEY=your_key_here" > .env
python main.py
```

2. **Frontend Setup** (NEW Terminal):
```powershell
# Terminal 2
cd "C:\Users\Patron\Desktop\Netlix for education\frontend"
npm install
npm run dev
```

3. **Test**:
- Open `http://localhost:8000` → Should see API message
- Open `http://localhost:3000` → Should see homepage

## Still Not Working?

### Check These:

1. **Firewall**: Windows Firewall might be blocking ports
   - Allow Python and Node through firewall

2. **Antivirus**: May be blocking localhost connections
   - Temporarily disable to test

3. **Browser Console**: Press F12 → Console tab
   - Look for red errors
   - Share error messages for help

4. **Backend Logs**: Check the terminal where backend is running
   - Look for error messages
   - Check if it says "Application startup complete"

5. **Frontend Logs**: Check the terminal where frontend is running
   - Look for compilation errors
   - Check if it says "Ready"

## Quick Test Without OpenAI API

If you don't have OpenAI API key yet, the preloaded courses should still work:

1. Start backend (even without API key, it will seed sample data)
2. Start frontend
3. Go to homepage - you should see preloaded courses
4. Click on courses - they should work
5. AI Tutor won't work without API key, but everything else should

## Need More Help?

Share:
1. What error message you see (exact text)
2. Browser console errors (F12 → Console)
3. Backend terminal output
4. Frontend terminal output


