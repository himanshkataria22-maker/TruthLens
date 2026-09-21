from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import HealthResponse, VerifyRequest, VerifyResponse
from pipeline import run_pipeline

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
    
    response = await run_pipeline(request.text)
    return response
