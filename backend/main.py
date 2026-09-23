import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from models import HealthResponse, VerifyRequest, VerifyResponse, ImageVerifyRequest, ImageExtractResponse, ExplainRequest, ExplanationOutput
from pipeline import run_pipeline, run_pipeline_streaming
from llm import extract_text_from_image
from agents.explanation_agent import generate_explanation
from demo_cache import find_cached_claim, stream_cached_result
from rate_limiter import rate_limiter, get_client_ip
from validators import validate_claim_text
import json
import base64
import os

# Check and warn about missing API keys on startup
def _check_api_keys_on_startup():
    """Check for required API keys at startup and log warnings."""
    llm_key = os.getenv("LLM_API_KEY", "").strip()
    openai_key = os.getenv("OPENAI_API_KEY", "").strip()
    groq_key = os.getenv("GROQ_API_KEY", "").strip()
    search_key = os.getenv("SEARCH_API_KEY", "").strip()
    
    has_llm = llm_key and not llm_key.startswith("your_")
    has_openai = openai_key and not openai_key.startswith("your_")
    has_groq = groq_key and not groq_key.startswith("your_")
    has_search = search_key and not search_key.startswith("your_")
    
    if not (has_llm or has_openai or has_groq):
        print("\n" + "="*70)
        print("[TruthLens WARNING] ⚠️  NO LLM API KEY CONFIGURED")
        print("="*70)
        print("The following features will FAIL until you configure an API key:")
        print("  • Claim extraction from text")
        print("  • Web research and source verification")
        print("  • Explanation generation")
        print("  • Image/screenshot OCR and text extraction")
        print("\nTo fix this:")
        print("1. Open: backend/.env")
        print("2. Add ONE of:")
        print("   - LLM_API_KEY=sk_your_openai_key (for OpenAI)")
        print("   - LLM_API_KEY=gsk_your_groq_key (for Groq)")
        print("   - LLM_API_KEY=AIza_your_gemini_key (for Google Gemini)")
        print("   OR set GROQ_API_KEY, OPENAI_API_KEY individually")
        print("3. Restart the backend server")
        print("="*70 + "\n")
    else:
        provider = "Unknown"
        if has_llm:
            if llm_key.startswith("gsk_"):
                provider = "Groq"
            elif llm_key.startswith("AIza"):
                provider = "Google Gemini"
            else:
                provider = "OpenAI"
        elif has_groq:
            provider = "Groq"
        elif has_openai:
            provider = "OpenAI"
        print(f"[TruthLens INFO] ✓ LLM API Key configured ({provider} provider)")
    
    if not has_search:
        print("[TruthLens WARNING] SEARCH_API_KEY not configured — web research will fail (optional)")

app = FastAPI(
    title="TruthLens API",
    description="Multi-agent truth verification pipeline for regional languages and English",
    version="1.0.0"
)

# Check API keys on startup
_check_api_keys_on_startup()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    """Rate limit verification requests per IP address."""
    if request.method != "OPTIONS" and request.url.path in ["/verify", "/verify/stream"]:
        ip = get_client_ip(request)
        if not rate_limiter.is_allowed(ip):
            return JSONResponse(
                status_code=429,
                content={
                    "error": True,
                    "message": "Too many requests. Please wait a moment and try again."
                },
                headers={"Access-Control-Allow-Origin": "*"}
            )
    return await call_next(request)

@app.get("/", tags=["General"])
async def root():
    return {
        "name": "TruthLens API",
        "status": "active",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return HealthResponse(status="ok", version="1.0.0")

@app.post("/verify", response_model=VerifyResponse, tags=["Verification"])
async def verify(request: VerifyRequest):
    """Execute full 5-agent TruthLens verification pipeline."""
    # Validate claim text
    is_valid, error_msg = validate_claim_text(request.text)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)
    
    # Check demo cache
    demo_mode = os.getenv("DEMO_MODE", "false").lower() == "true"
    cached_result = find_cached_claim(request.text, demo_mode=demo_mode)
    
    if cached_result:
        # Return cached result instantly
        return VerifyResponse(**cached_result)
    elif demo_mode:
        # Demo mode but no cache hit
        raise HTTPException(status_code=404, detail="This claim is not in the demo cache. Add it using build_demo_cache.py or disable DEMO_MODE.")
    
    # Run real pipeline
    response = await run_pipeline(request.text, target_language=request.target_language)
    return response

@app.post("/verify/stream", tags=["Verification"])
async def verify_stream(request: VerifyRequest):
    """Execute pipeline with Server-Sent Events streaming progress."""
    # Validate claim text
    is_valid, error_msg = validate_claim_text(request.text)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)
    
    # Check demo cache
    demo_mode = os.getenv("DEMO_MODE", "false").lower() == "true"
    cached_result = find_cached_claim(request.text, demo_mode=demo_mode)
    
    if cached_result:
        # Stream cached result with delays
        async def cached_generator():
            async for event in stream_cached_result(cached_result):
                yield f"data: {json.dumps(event)}\n\n"
        
        return StreamingResponse(
            cached_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            }
        )
    elif demo_mode:
        raise HTTPException(status_code=404, detail="This claim is not in the demo cache. Add it using build_demo_cache.py or disable DEMO_MODE.")
    
    # Run real pipeline stream
    async def event_generator():
        async for event in run_pipeline_streaming(request.text, target_language=request.target_language):
            # SSE format: data: {json}\n\n
            yield f"data: {json.dumps(event)}\n\n"
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@app.post("/verify/image", response_model=ImageExtractResponse, tags=["Verification"])
async def verify_image(request: ImageVerifyRequest):
    """Extract text from an uploaded image using OCR/Vision."""
    if not request.image_data:
        raise HTTPException(status_code=400, detail="Image data must not be empty.")
    
    # Validate image size (max 5MB for base64)
    try:
        # Remove data URI prefix if present
        image_data = request.image_data
        if "," in image_data:
            image_data = image_data.split(",", 1)[1]
        
        # Decode to check size
        decoded = base64.b64decode(image_data)
        size_mb = len(decoded) / (1024 * 1024)
        
        if size_mb > 5:
            raise HTTPException(status_code=400, detail=f"Image too large ({size_mb:.1f}MB). Maximum size is 5MB.")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image data: {str(e)}")
    
    result = await extract_text_from_image(request.image_data)
    
    # Check if an error occurred
    if "error" in result:
        error_msg = result["error"]
        print(f"[TruthLens] [/verify/image] Extraction error: {error_msg}")
        
        # 503 for API key issues, 400 for other issues
        if "API key" in error_msg or "invalid" in error_msg.lower():
            raise HTTPException(
                status_code=503,
                detail=f"Image verification temporarily unavailable: {error_msg}"
            )
        else:
            raise HTTPException(status_code=400, detail=error_msg)
    
    if not result["extracted_text"]:
        raise HTTPException(
            status_code=400,
            detail="Could not extract any readable text from the image. Please ensure the image contains clear, readable text, or try pasting the claim as text instead."
        )
    
    return ImageExtractResponse(
        extracted_text=result["extracted_text"],
        language=result["language"]
    )


@app.post("/explain", response_model=ExplanationOutput, tags=["Verification"])
async def explain(request: ExplainRequest):
    """Regenerate explanation in a different language without re-running verification."""
    explanation_data = await generate_explanation(
        claim=request.claim,
        verdict=request.verdict,
        confidence=request.confidence,
        language=request.target_language,
        evidence=request.evidence
    )
    return explanation_data
