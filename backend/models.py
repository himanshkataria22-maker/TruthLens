from typing import List, Optional, Literal, Dict
from pydantic import BaseModel, Field
from datetime import datetime

class AgentParsingError(Exception):
    """Raised when an LLM agent response fails JSON parsing after retry."""
    def __init__(self, agent_name: str, raw_response: str, message: str = ""):
        self.agent_name = agent_name
        self.raw_response = raw_response
        self.message = message or f"[{agent_name}] Failed to parse valid JSON response after retry."
        super().__init__(self.message)

class AgentExecutionError(Exception):
    """Raised when an agent execution fails due to LLM/API or pipeline errors."""
    def __init__(self, agent_name: str, message: str, raw_response: Optional[str] = None):
        self.agent_name = agent_name
        self.message = message
        self.raw_response = raw_response
        super().__init__(f"[{agent_name}] {message}")

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
    explanations: Dict[str, str] = Field(default_factory=dict)

class MultiExplanationOutput(BaseModel):
    explanations: Dict[str, str] = Field(description="Dictionary mapping ISO language codes (en, hi, mr, ta, bn) to explanations")

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
    target_language: Optional[str] = None

class ImageVerifyRequest(BaseModel):
    image_data: str = Field(description="Base64 encoded image data")
    
class ImageExtractResponse(BaseModel):
    extracted_text: str
    language: str

class ExplainRequest(BaseModel):
    claim: str
    verdict: str
    confidence: int
    evidence: List[EvidenceItem]
    target_language: str = "en"

class VerifyResponse(BaseModel):
    claim: str
    language: str
    verdict: str
    confidence: int
    explanation: str
    explanations: Dict[str, str] = Field(default_factory=dict)
    evidence: List[EvidenceItem] = []
    steps: List[StepLog] = []
