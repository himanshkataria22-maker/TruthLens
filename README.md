# TruthLens 🔍

TruthLens is an AI-powered multi-agent fact-checking and truth verification system designed to extract claims from text or screenshots, search authoritative evidence, evaluate source credibility, determine veracity verdicts, and produce transparent reasoning trails.

---

## 📁 Project Structure

```text
truthlens/
├── frontend/                 # Next.js app (React + Tailwind CSS)
│   ├── app/
│   │   ├── globals.css        # Tailwind & global styles
│   │   ├── layout.tsx         # Root layout & navigation header
│   │   ├── page.tsx           # Input screen (paste text / upload screenshot)
│   │   └── result/page.tsx    # Verdict + evidence trail screen
│   └── components/
│       ├── ClaimInput.tsx     # Claim submission & file upload component
│       ├── VerdictCard.tsx    # Verdict badge, score & synthesized reasoning
│       └── EvidenceTrail.tsx  # 5-Agent execution stepper & source citations
├── backend/                   # FastAPI app (Python)
│   ├── main.py                # FastAPI endpoints & CORS configuration
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── claim_extractor.py     # Agent 1: Extracts factual claims
│   │   ├── research_agent.py      # Agent 2: Queries web/evidence sources
│   │   ├── credibility_filter.py  # Agent 3: Evaluates domain authority & bias
│   │   ├── verification_agent.py  # Agent 4: Verifies claims against evidence
│   │   └── explanation_agent.py   # Agent 5: Synthesizes final explanations
│   ├── pipeline.py            # Orchestrates the 5 agents in sequence
│   ├── models.py              # Pydantic schemas (Claims, Evidence, Verdicts)
│   ├── .env.example           # Environment variable template
│   └── requirements.txt       # Python dependencies
└── README.md                  # Project documentation
```

---

## 🤖 5-Agent Pipeline Architecture

1. **Claim Extractor Agent** (`agents/claim_extractor.py`): Parses user input or OCR text to isolate discrete, testable factual claims.
2. **Research Agent** (`agents/research_agent.py`): Performs targeted multi-source search queries across news archives and factual registries.
3. **Credibility Filter Agent** (`agents/credibility_filter.py`): Analyzes source reputation, domain authority, and removes biased/unreliable sources.
4. **Verification Agent** (`agents/verification_agent.py`): Cross-checks claims against vetted evidence to formulate a veracity verdict.
5. **Explanation Agent** (`agents/explanation_agent.py`): Synthesizes transparent, human-readable explanations with verifiable evidence links.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **Python**: v3.10 or higher
- **npm** or **yarn** / **pnpm**

---

### 1. Setting Up and Running Backend (FastAPI)

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd truthlens/backend
   ```

2. (Optional but recommended) Create and activate a Python virtual environment:
   ```bash
   # Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # macOS / Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Create your local `.env` configuration:
   ```bash
   # Windows
   copy .env.example .env

   # macOS / Linux
   cp .env.example .env
   ```

5. Start the FastAPI server with auto-reload:
   ```bash
   uvicorn main:app --reload
   ```

   - **Backend API**: [http://localhost:8000](http://localhost:8000)
   - **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
   - **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

---

### 2. Setting Up and Running Frontend (Next.js + Tailwind CSS)

1. Open a second terminal and navigate to the frontend directory:
   ```bash
   cd truthlens/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   - [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Environment Variables

Copy `backend/.env.example` to `backend/.env` and supply your API keys:

| Variable | Description |
|---|---|
| `LLM_API_KEY` | API Key for LLM provider (OpenAI, Anthropic, Gemini, Groq, etc.) |
| `SEARCH_API_KEY` | API Key for Web Search engine (Tavily, Serper, Google Search, etc.) |
| `MONGODB_URI` | Connection URI for storing verification histories and evidence logs |

---

## 🧪 Testing and Verification

- **Backend Health Check**:
  ```bash
  curl http://localhost:8000/health
  ```
- **Backend Verification API**:
  ```bash
  curl -X POST http://localhost:8000/api/verify -H "Content-Type: application/json" -d "{\"text\": \"Sample claim to test\"}"
  ```
- **Frontend Build Validation**:
  ```bash
  cd truthlens/frontend
  npm run build
  ```


---

## ✨ New Features

### 1. Real-Time Progress Streaming (Server-Sent Events)
- **Endpoint**: `POST /verify/stream`
- Live progress updates as each pipeline step completes
- Frontend shows real-time step transitions with actual durations
- Automatic fallback to regular `/verify` endpoint if streaming fails

### 2. Screenshot & Image Input with OCR
- **Endpoint**: `POST /verify/image`
- Upload screenshots of WhatsApp forwards or claims (PNG/JPG, max 5MB)
- Automatic text extraction using LLM vision capabilities
- Editable extracted text before verification
- Supports Hindi, English, and other Indian languages
- Friendly error messages for unreadable images

### 3. Multi-Language Explanation Support
- **Endpoint**: `POST /explain`
- Optional `target_language` parameter in `/verify` and `/verify/stream`
- Real-time language switching without re-running verification
- Supported languages: Hindi (हिन्दी), English, Marathi (मराठी), Tamil (தமிழ்), Bengali (বাংলা)
- Language selector chips on result screen
- Research and verification stay the same, only explanation changes

### 4. Demo Cache for Instant Results
- **File**: `demo_cache.json`
- Pre-verified claims return instant cached results
- Smart fuzzy matching (70% word overlap) for cache hits
- Simulated streaming events with realistic delays for demo mode
- **Script**: `build_demo_cache.py` - Regenerate cache with real pipeline
- **Environment Variable**: `DEMO_MODE=true` for cache-only behavior
- 3 pre-loaded demo claims included

### 5. Social Sharing
- **WhatsApp Share Button**: Share verdict summary directly via WhatsApp
- **Copy Result Button**: Copy formatted summary with emoji verdict, claim, reason, and source
- Summary format: `{emoji} {verdict}\n"{claim}"\n{reason}\n{source}\n✓ Verified with TruthLens`
- Mobile-optimized sharing UI

---

## 🧪 Testing New Features

### Test Streaming Endpoint
```bash
cd backend
python test_pipeline.py --stream
```

### Test Demo Cache
```bash
cd backend
python test_new_features.py
```

### Rebuild Demo Cache
```bash
cd backend
python build_demo_cache.py
```

### Test Image Extraction (requires API key with vision support)
```bash
curl -X POST http://localhost:8000/verify/image \
  -H "Content-Type: application/json" \
  -d '{"image_data": "data:image/jpeg;base64,..."}'
```

---

## 📝 API Endpoints Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/verify` | Full verification pipeline (cached if available) |
| POST | `/verify/stream` | Streaming verification with SSE progress events |
| POST | `/verify/image` | Extract text from image screenshot |
| POST | `/explain` | Regenerate explanation in different language |

---

## 🔧 Configuration

### Backend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `LLM_API_KEY` | API key for LLM provider | Required |
| `LLM_MODEL` | Model name (e.g., `gpt-4o-mini`, `gemini-1.5-flash`) | Auto-detected |
| `LLM_BASE_URL` | Custom LLM endpoint | Auto-detected |
| `SEARCH_API_KEY` | API key for web search | Required |
| `DEMO_MODE` | Enable cache-only mode (`true`/`false`) | `false` |

### Frontend Environment Variables

Create `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 📦 Deployment Notes

1. Both `/verify` and `/verify/stream` maintain backward compatibility
2. Old `/verify` behavior unchanged - new streaming is opt-in via `/verify/stream`
3. Image upload gracefully degrades if vision API unavailable
4. Demo cache improves demo/testing performance without affecting production
5. Language switching doesn't require re-verification (instant response)

---

## 🎯 Commands Summary

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload                 # Start server
python test_pipeline.py                   # Test basic pipeline
python test_pipeline.py --stream          # Test streaming
python test_new_features.py               # Test new features
python build_demo_cache.py                # Rebuild demo cache

# Frontend
cd frontend
npm install
npm run dev                               # Start dev server
npm run build                             # Production build
npm run start                             # Production server
```

---

## 🐛 Troubleshooting

### Streaming not working
- Check that CORS is properly configured in backend
- Ensure frontend is using fetch with proper headers
- Fallback to `/verify` is automatic on streaming failure

### Image extraction failing
- Verify LLM API key supports vision (GPT-4o, Gemini, etc.)
- Check image is under 5MB and valid PNG/JPG
- Groq vision models: use `llama-3.2-90b-vision-preview`

### Demo cache not matching
- Run `python test_new_features.py` to verify cache hits
- Normalized text requires 70% word overlap
- Regenerate cache with `python build_demo_cache.py`

### Language switching slow
- First language change may be slower (cold start)
- Subsequent changes should be instant
- Check `/explain` endpoint is responsive

