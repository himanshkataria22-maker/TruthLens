from typing import List, Optional, Literal
from pydantic import BaseModel, Field
from datetime import datetime

class HealthResponse(BaseModel):
    status: str = "ok"
    version: str = "0.1.0"
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ClaimExtractorOutput(BaseModel):
    language: str = Field(description="ISO language code, e.g. hi, en, mr, ta, te, bn")
    claim: str = Field(description="Single core verifiable factual claim")
    queries: List[str] = Field(description="3 search queries: user language, English, neutral keyword")

class RawSearchResult(BaseModel):
    title: str
    url: str
    snippet: str
    domain: str

class CredibleSource(BaseModel):
    title: str
    url: str
    snippet: str
    domain: str
    tier: int = Field(description="Tier 1: Gov/Official, Tier 2: Fact-checkers/Established news, Tier 3: Other")
    confidence_label: str = "high confidence"

class SourceStance(BaseModel):
    url: str
    stance: Literal["supports", "contradicts", "neutral"]
    reason: str

class VerificationOutput(BaseModel):
    verdict: Literal["SUPPORTED", "FALSE", "MISLEADING", "UNVERIFIABLE"]
    confidence: int = Field(ge=0, le=100)
    per_source_stance: List[SourceStance] = []

class ExplanationOutput(BaseModel):
    explanation: str
    language: str

class EvidenceItem(BaseModel):
    title: str
    url: str
    domain: str
    tier: int
    stance: str
    reason: str

class StepLog(BaseModel):
    name: str
    duration_ms: int

class VerifyRequest(BaseModel):
    text: str

class VerifyResponse(BaseModel):
    claim: str
    language: str
    verdict: str
    confidence: int
    explanation: str
    evidence: List[EvidenceItem] = []
    steps: List[StepLog] = []
