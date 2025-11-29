# Debugging VoicePal Translation Error

## 🔍 Step 1: Check Browser Console for API Key Error

1. Open your deployed app: https://voicepal-781740614996.us-central1.run.app
2. Press **F12** to open Developer Tools
3. Click the **Console** tab
4. Look for error messages

### What to Look For:

**If API Key is Missing:**
```
Gemini API Key not found
```

**If API Key is Invalid:**
```
Error: [GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent: [400 Bad Request] API key not valid
```

**If API Key is Valid but Quota Exceeded:**
```
Error: [GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent: [429 Too Many Requests]
```

## 🔍 Step 2: Test API Key Locally

Run the app locally to see if the API key works:

```powershell
# Make sure you're in the project directory
cd c:\Abhinav\tutorial\agent-voicelabs

# Start local dev server
npm run dev
```

Then:
1. Open http://localhost:5173
2. Try speaking and see if translation works
3. Check the console for errors

**If it works locally but not on Cloud Run** → API key wasn't embedded during build  
**If it doesn't work locally either** → API key is invalid or expired

## 🔍 Step 3: Verify API Key in .env File

Check your `.env` file:

```powershell
Get-Content .env
```

You should see:
```
VITE_GEMINI_API_KEY=AIzaSyDDgAe16M2_DHE-cM8ER6Tdi58jx4oj5H0
```

## 🔍 Step 4: Test API Key Directly

Create a test script to verify the API key works:

```powershell
# Create a test file
@"
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyDDgAe16M2_DHE-cM8ER6Tdi58jx4oj5H0';
const genAI = new GoogleGenerativeAI(API_KEY);

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent('Translate to Vietnamese: Hello');
    const response = await result.response;
    console.log('✅ API Key works! Translation:', response.text());
  } catch (error) {
    console.error('❌ API Key failed:', error.message);
  }
}

test();
"@ | Out-File -FilePath test-api.js -Encoding utf8

# Run the test
node test-api.js
```

## 📊 Diagnosis Results

| Symptom | Diagnosis | Solution |
|---------|-----------|----------|
| Console shows "API Key not found" | Key wasn't embedded in build | Rebuild with `.\deploy.ps1` |
| Console shows "API key not valid" | Invalid or expired key | Get new key from Google AI Studio |
| Console shows "429 Too Many Requests" | Quota exceeded | Wait or upgrade quota |
| Works locally, fails on Cloud Run | Build issue | Rebuild and redeploy |
| Fails both locally and on Cloud Run | Invalid API key | Replace with valid key |

## ✅ Quick Fix

The fastest way to fix this is to rebuild with the correct API key:

```powershell
# This will read from .env and rebuild
.\deploy.ps1
```

This ensures the API key is properly embedded during the Docker build process.
