"""Orchestrates the 5 TruthLens agents in sequence."""

from typing import Optional
from models import VerificationResponse, VerificationVerdict
from agents.claim_extractor import extract_claims
from agents.research_agent import research_claim
from agents.credibility_filter import filter_credibility
from agents.verification_agent import verify_claim
from agents.explanation_agent import generate_explanation

async def run_verification_pipeline(text: Optional[str] = None, image_data: Optional[bytes] = None) -> VerificationResponse:
    """
    Executes the 5-agent sequential pipeline:
    1. Claim Extractor: Parse atomic claims
    2. Research Agent: Search evidence
    3. Credibility Filter: Score and filter source authority
    4. Verification Agent: Determine veracity verdict
    5. Explanation Agent: Generate synthesis explanation
    """
    # Step 1: Extract claims
    claims = await extract_claims(text=text, image_data=image_data)
    
    verdicts = []
    # Steps 2-4: Process each extracted claim
    for claim in claims:
        raw_evidence = await research_claim(claim)
        filtered_evidence = await filter_credibility(raw_evidence)
        verdict = await verify_claim(claim, filtered_evidence)
        verdicts.append(verdict)
        
    # Step 5: Synthesize transparent explanation
    summary = await generate_explanation(verdicts)
    
    return VerificationResponse(
        id="result-stub-001",
        original_input=text or "Input content",
        claims=claims,
        verdicts=verdicts,
        summary_explanation=summary
    )
