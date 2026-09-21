from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import HealthResponse, VerificationRequest, VerificationResponse
from pipeline import run_verification_pipeline

app = FastAPI(
    title="TruthLens API",
    description="AI-powered multi-agent fact-checking and truth verification pipeline",
    version="0.1.0"
)

# Enable CORS for frontend integration
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
        "status": "running",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Basic health check endpoint."""
    return HealthResponse(status="ok", version="0.1.0")

@app.post("/api/verify", response_model=VerificationResponse, tags=["Verification"])
async def verify_content(request: VerificationRequest):
    """Execute the multi-agent truth verification pipeline."""
    if not request.text and not request.image_url:
        raise HTTPException(status_code=400, detail="Either 'text' or 'image_url' must be provided")
    result = await run_verification_pipeline(text=request.text)
    return result
