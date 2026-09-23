# TruthLens - Quick Start Guide

## 🚀 Start the Application

### Terminal 1 - Backend
```bash
cd backend
uvicorn main:app --reload
```
✓ Backend: http://localhost:8000  
✓ API Docs: http://localhost:8000/docs

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```
✓ Frontend: http://localhost:3000

---

## ✅ What's Working (Features 1-5)

### ✨ Feature 1: Real Progress Streaming
- **Endpoint**: `POST /verify/stream`
- Real-time step completion events via SSE
- Frontend shows live progress animation
- Automatic fallback to `/verify`

### 📸 Feature 2: Screenshot Input
- **Endpoint**: `POST /verify/image`
- Upload screenshots (PNG/JPG, max 5MB)
- OCR text extraction with LLM vision
- Editable text before verification
- Supports all Indian languages

### 🌐 Feature 3: Target Language
- **Endpoint**: `POST /explain`
- Optional `target_language` in `/verify`
- Instant language switching (no re-verification)
- Supported: Hindi, English, Marathi, Tamil, Bengali
- Language selector chips on result screen

### ⚡ Feature 4: Demo Cache
- **File**: `demo_cache.json`
- 3 pre-verified claims for instant results
- Fuzzy matching (70% word overlap)
- Simulated streaming with realistic delays
- Enable with `DEMO_MODE=true` in `.env`

### 📱 Feature 5: Share
- WhatsApp share button
- Copy result with formatted summary
- Format: emoji + verdict + claim + reason + source
- Mobile-optimized

---

## 🧪 Run Tests

```bash
cd backend

# Basic pipeline
python test_pipeline.py

# Streaming test
python test_pipeline.py --stream

# Demo cache test
python test_new_features.py

# Complete integration test
python test_complete.py

# Rebuild demo cache
python build_demo_cache.py
```

---

## 📋 New API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/verify` | Full pipeline (with cache support) |
| POST | `/verify/stream` | SSE streaming with progress |
| POST | `/verify/image` | Extract text from image |
| POST | `/explain` | Regenerate explanation in new language |

---

## 🎯 Try These Test Claims

### Cached (Instant Results)
```
सावधान! 500 रुपये के नोट पर हरी पट्टी अगर गांधी जी की तस्वीर के पास नहीं है बल्कि गवर्नर के हस्ताक्षर के पास है तो वह नोट पूरी तरह से नकली है।
```
→ Expected: FALSE (96%)

```
UNESCO has officially declared the Indian National Anthem Jana Gana Mana as the best national anthem in the world.
```
→ Expected: FALSE (98%)

```
India won the ICC Men's T20 World Cup in June 2024 by defeating South Africa in Barbados.
```
→ Expected: SUPPORTED (99%)

---

## 🔧 Configuration

### Backend `.env`
```bash
LLM_API_KEY=your_api_key_here
LLM_MODEL=gpt-4o-mini          # or gemini-1.5-flash, llama-3.3-70b-versatile
SEARCH_API_KEY=your_search_key  # Optional
DEMO_MODE=false                 # Set to true for cache-only
```

### Frontend `.env.local`
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 📊 Feature Status

| Feature | Status | Tested |
|---------|--------|--------|
| 1. Real Progress Streaming | ✅ Complete | ✅ Pass |
| 2. Screenshot Input | ✅ Complete | ✅ Pass |
| 3. Target Language | ✅ Complete | ✅ Pass |
| 4. Demo Cache | ✅ Complete | ✅ Pass |
| 5. Share | ✅ Complete | ✅ Pass |
| 6. Optional Features | ⏸️ Skipped | - |

---

## 🎬 Usage Flow

1. **Open** http://localhost:3000
2. **Enter** text claim OR upload screenshot
3. **Watch** real-time streaming progress
4. **View** verdict + confidence + explanation
5. **Switch** language using selector chips
6. **Share** via WhatsApp or copy result

---

## 🐛 Troubleshooting

**Backend not starting?**
```bash
cd backend
pip install -r requirements.txt
```

**Frontend not building?**
```bash
cd frontend
npm install
```

**Streaming not working?**
- Check CORS settings in backend
- Fallback to `/verify` is automatic

**Image extraction failing?**
- Requires vision-capable LLM (GPT-4o, Gemini, Groq vision)
- Check API key has vision access

**Demo cache not matching?**
- Run `python test_new_features.py` to verify
- Rebuild with `python build_demo_cache.py`

---

## 📚 Documentation

- `README.md` - Full documentation
- `FEATURE_SUMMARY.md` - Detailed feature summary
- `QUICK_START.md` - This file

---

## ✨ What's New

All 5 requested features implemented and tested:
- ✅ Real-time streaming with SSE
- ✅ Image/screenshot OCR input
- ✅ Multi-language explanation switching
- ✅ Demo cache for instant results
- ✅ WhatsApp share + copy functionality

**Original `/verify` endpoint unchanged - fully backward compatible!**

---

🚀 **Ready to verify claims!**
