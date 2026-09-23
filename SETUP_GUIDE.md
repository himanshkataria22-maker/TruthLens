# TruthLens Setup & Configuration Guide

## Problem: Image Extraction Fails with 401 Unauthorized

When uploading screenshots for OCR verification, the error appeared:
```
"Image extraction failed: Client error '401 Unauthorized' for url 'https://api.groq.com/openai/v1/chat/completions'"
```

## Root Cause

The backend `.env` file was missing, so no API keys were configured. When the image extraction tried to call the vision API, it had no valid credentials, resulting in a 401 Unauthorized error.

## Solution: Complete Setup Steps

### Step 1: Configure Your Backend API Keys

1. **Open** `backend/.env`
   - A template file with clear instructions is now included

2. **Add YOUR API Key** - Choose ONE provider:

   **Option A: OpenAI (Recommended for best OCR quality)**
   ```env
   LLM_API_KEY=sk_your_openai_api_key_here
   ```

   **Option B: Groq (Free tier available)**
   ```env
   LLM_API_KEY=gsk_your_groq_api_key_here
   ```
   
   **Option C: Google Gemini**
   ```env
   LLM_API_KEY=AIza_your_google_gemini_key_here
   ```

   **Option D: Use Alternative Variable Names**
   ```env
   OPENAI_API_KEY=sk_your_key
   # OR
   GROQ_API_KEY=gsk_your_key
   ```

3. **Add Search API Key** (Optional but recommended)
   ```env
   SEARCH_API_KEY=your_tavily_or_serper_key
   ```

### Step 2: Restart Backend Server

⚠️ **IMPORTANT**: Environment variables are NOT hot-reloaded!

```bash
# Stop the current backend (Ctrl+C)
# Then restart:
cd backend
python -m uvicorn main:app --port 8000
```

You should see:
```
[TruthLens INFO] ✓ LLM API Key configured (Groq provider)
```

If API key is missing, you'll see:
```
[TruthLens WARNING] ⚠️  NO LLM API KEY CONFIGURED
The following features will FAIL until you configure an API key:
  • Claim extraction from text
  • Web research and source verification
  • Explanation generation
  • Image/screenshot OCR and text extraction
```

### Step 3: Configure Frontend (Optional)

If running backend on a non-standard port, create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Step 4: Test Image Extraction

1. Go to http://localhost:3000 (or 3001/3002 if ports are busy)
2. Click "Upload Screenshot"
3. Select a screenshot with readable text
4. If successful, you'll see extracted text and detected language

## Error Messages & Troubleshooting

### "Image verification temporarily unavailable" (503 Error)
**Cause**: API key is invalid or expired
**Fix**: 
- Verify your API key in `backend/.env` is correct
- Check it hasn't expired
- Restart the backend server

### "Could not extract any readable text from the image"
**Cause**: Image is unclear, too blurry, or doesn't contain readable text
**Fix**:
- Use a clearer screenshot
- Ensure text is readable (not too small)
- Try zooming in on the claim text
- Fall back to text input instead

### "No LLM API Key configured" warning on startup
**Cause**: `backend/.env` is missing or empty
**Fix**:
- Copy `backend/.env.example` to `backend/.env` (already done for you)
- Add your API key to `backend/.env`
- Restart the backend

## Supported LLM Providers for Image Extraction

| Provider | Vision Support | Free Tier | Model |
|----------|---|---|---|
| **OpenAI** | ✅ Excellent | Limited ($5 free) | gpt-4o-mini |
| **Groq** | ✅ Good | ✅ Yes | llama-3.2-90b-vision-preview |
| **Google Gemini** | ✅ Excellent | ✅ Yes | gemini-1.5-flash |

## How Image Extraction Works

1. **Upload Screenshot** → Frontend sends base64-encoded image to backend
2. **Backend Receives** → Validates image size (max 5MB) and format
3. **Vision API Call** → Calls `https://api.groq.com/openai/v1/chat/completions` (or provider-specific endpoint)
4. **Extract Text** → LLM extracts all visible text and detects language
5. **Parse Result** → Backend returns extracted text + language code
6. **Display to User** → Frontend shows extracted text for editing before verification

## File Changes Made

### New Files Created
- `backend/.env` — Configuration file for API keys (empty, ready for your keys)
- `frontend/.env.local` — Frontend environment configuration (optional)

### Files Modified

**backend/main.py**
- Added `_check_api_keys_on_startup()` function to warn about missing keys at startup
- Improved `/verify/image` endpoint error handling
- Returns 503 (Service Unavailable) for API key errors
- Returns 400 (Bad Request) for image format errors

**backend/llm.py**
- Enhanced `extract_text_from_image()` error handling:
  - Specific detection of 401 Unauthorized errors
  - Clear error messages guiding users to add API key
  - Fallback suggestion to use text input instead
  - Detailed logging for debugging

## Verification Checklist

- [ ] `backend/.env` exists and contains your API key
- [ ] Backend starts without "NO LLM API KEY CONFIGURED" warning
- [ ] Text-based verification works (test on homepage)
- [ ] Image upload form appears (click "Upload Screenshot")
- [ ] Image extraction succeeds or shows helpful error message
- [ ] Screenshot shows extracted text ready for editing

## Support

If image extraction still fails after completing these steps:

1. **Check logs**: Look at backend console output for "[TruthLens ERROR]" messages
2. **Verify API key**: Test it directly with your provider's API
3. **Try text input**: Use the text input method as a workaround
4. **Check internet**: Ensure backend can reach the LLM provider's API

For more help, see the main README.md or check the backend logs.
