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
