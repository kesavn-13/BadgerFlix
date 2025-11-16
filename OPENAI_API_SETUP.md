# 🔑 OpenAI API Setup Guide

## ⚠️ Important: ChatGPT Plus ≠ OpenAI API

**ChatGPT Plus** (the $20/month subscription) is **NOT** the same as **OpenAI API access**.

You need a **separate OpenAI API account** with billing/credits.

## 🚀 How to Fix the Quota Error

### Step 1: Go to OpenAI Platform
Visit: **https://platform.openai.com**

### Step 2: Sign Up / Log In
- If you don't have an account, create one
- Use a different email if needed (separate from ChatGPT Plus)

### Step 3: Add Payment Method
1. Go to: **https://platform.openai.com/account/billing**
2. Click **"Add payment method"**
3. Add a credit card

### Step 4: Add Credits
- OpenAI API is **pay-as-you-go**
- You'll be charged per API call
- Whisper (transcription): ~$0.006 per minute
- GPT-4o-mini: ~$0.15 per 1M input tokens

### Step 5: Get Your API Key
1. Go to: **https://platform.openai.com/api-keys**
2. Click **"Create new secret key"**
3. Copy the key (starts with `sk-...`)
4. Update your `.env` file in the `backend` folder:
   ```
   OPENAI_API_KEY=sk-your-new-key-here
   ```

### Step 6: Restart Backend
Restart your backend server to use the new API key.

## 💰 Estimated Costs

For testing LectureFlix:
- **Small MP3 (5 minutes)**: ~$0.03 (transcription) + ~$0.01 (GPT) = **~$0.04**
- **Medium MP3 (30 minutes)**: ~$0.18 (transcription) + ~$0.05 (GPT) = **~$0.23**
- **Large MP3 (1 hour)**: ~$0.36 (transcription) + ~$0.10 (GPT) = **~$0.46**

**Very affordable for testing!**

## 🎯 Quick Test

Once you have API credits:
1. Restart backend
2. Try uploading your MP3 again
3. It should work!

## ❓ FAQ

**Q: Can I use my ChatGPT Plus account?**
A: No, they're separate. You need API access.

**Q: How much do I need to add?**
A: Start with $5-10 for testing. You can set usage limits.

**Q: Will I be charged automatically?**
A: Yes, but you can set monthly spending limits in billing settings.

---

**Need help?** Check: https://platform.openai.com/docs/guides/error-codes


