from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from models import HealthResponse, VerifyRequest, VerifyResponse, ImageVerifyRequest, ImageExtractResponse, ExplainRequest, ExplanationOutput
from pipeline import run_pipeline, run_pipeline_streaming
from llm import extract_text_from_image
from agents.explanation_agent import generate_explanation
from demo_cache import find_cached_claim, stream_cached_result
import json
import base64
import os

app = FastAPI(
    title="TruthLens API",
    description="Multi-agent truth verification pipeline for regional languages and English",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="Text claim must not be empty.")
    
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
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="Text claim must not be empty.")
    
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
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image data: {str(e)}")
    
    result = await extract_text_from_image(request.image_data)
    
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    
    if not result["extracted_text"]:
        raise HTTPException(status_code=400, detail="Could not extract any readable text from the image. Please ensure the image contains clear, readable text.")
    
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
