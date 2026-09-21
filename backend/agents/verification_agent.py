import json
from typing import List
from models import CredibleSource, VerificationOutput, SourceStance
from llm import call_llm_json

SYSTEM_PROMPT = """You are the Verification Agent for TruthLens.
Your task is to analyze a factual claim against a list of ranked evidence sources (Tier 1 official sources, Tier 2 fact-checkers/news, Tier 3 web sources).

Instructions:
1. For EACH source provided, determine its stance regarding the claim:
   - "supports": Evidence directly corroborates the claim.
   - "contradicts": Evidence refutes, disproves, or debunks the claim.
   - "neutral": Evidence discusses related topics without directly confirming or denying.
   Provide a concise 1-line reason for each source.
2. Determine the single overall verdict:
   - "SUPPORTED": Clear consensus from credible sources confirming the claim.
   - "FALSE": Evidence proves the claim is false, fake, fabricated, or a debunked hoax.
   - "MISLEADING": The claim is partly true but exaggerated, outdated, missing critical context, or manipulated.
   - "UNVERIFIABLE": Insufficient, vague, or contradictory evidence to determine truth. Never guess.
3. Assign a confidence score from 0 to 100 based on source authority and agreement.
"""

async def verify_claim(claim: str, sources: List[CredibleSource]) -> VerificationOutput:
    if not sources:
        return VerificationOutput(
            verdict="UNVERIFIABLE",
            confidence=0,
            per_source_stance=[]
        )

    sources_data = []
    for s in sources:
        sources_data.append({
            "title": s.title,
            "url": s.url,
            "domain": s.domain,
            "tier": s.tier,
            "snippet": s.snippet
        })

    prompt = (
        f"Claim to Verify:\n\"{claim}\"\n\n"
        f"Ranked Evidence Sources:\n{json.dumps(sources_data, indent=2)}\n\n"
        f"Analyze each source's stance and determine the final verdict and confidence score."
    )

    result = await call_llm_json(
        prompt=prompt,
        system_prompt=SYSTEM_PROMPT,
        response_model=VerificationOutput
    )
    return result
