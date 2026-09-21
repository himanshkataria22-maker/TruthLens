from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class HealthResponse(BaseModel):
    status: str = "ok"
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    version: str = "0.1.0"

class EvidenceSource(BaseModel):
    title: str
    url: str
    snippet: str
    credibility_score: float = 0.0
    source_type: str = "web"

class ClaimItem(BaseModel):
    id: str
    statement: str
    confidence: float = 0.0

class VerificationVerdict(BaseModel):
    claim_id: str
    verdict: str  # e.g., 'True', 'False', 'Partially True', 'Unverified'
    confidence_score: float
    explanation: str
    evidence_trail: List[EvidenceSource] = []

class VerificationRequest(BaseModel):
    text: Optional[str] = None
    image_url: Optional[str] = None

class VerificationResponse(BaseModel):
    id: str
    original_input: str
    claims: List[ClaimItem] = []
    verdicts: List[VerificationVerdict] = []
    summary_explanation: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)
