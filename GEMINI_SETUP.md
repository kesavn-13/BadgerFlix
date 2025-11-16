# 🤖 Gemini API Setup Guide

## ✅ Great Choice! Gemini API is Free!

Gemini API offers a generous free tier, perfect for your hackathon project!

## 🚀 Quick Setup

### Step 1: Get Your Gemini API Key

1. Go to: **https://aistudio.google.com/apikey**
2. Click **"Create API Key"**
3. Select or create a Google Cloud project (free tier is fine)
4. Copy your API key (starts with `AIza...`)

### Step 2: Update Your .env File

In the `backend` folder, update or create `.env`:

```bash
GEMINI_API_KEY=AIza-your-key-here
```

**OR** if you want to keep OpenAI as backup:

```bash
GEMINI_API_KEY=AIza-your-key-here
OPENAI_API_KEY=sk-your-openai-key-here  # Optional backup
```

### Step 3: Restart Backend

Restart your backend server to load the new API key.

## 🎯 What Gemini Handles

- ✅ **Episode Generation** - Breaks transcript into episodes
- ✅ **AI Tutor** - Answers student questions
- ✅ **Audio Transcription** - Gemini 1.5 can process audio directly!

## 💰 Cost

**FREE!** Gemini API has a generous free tier:
- 15 requests per minute
- 1,500 requests per day
- Perfect for hackathon demos!

## 🔄 Fallback

The code automatically falls back to OpenAI if:
- Gemini API key is not set
- Gemini request fails

## 📝 Notes

- Gemini 1.5 Flash is used (fast and free)
- Audio files are uploaded to Gemini for transcription
- Files are automatically cleaned up after processing

---

**You're all set!** Just add your Gemini API key and restart the backend! 🚀


