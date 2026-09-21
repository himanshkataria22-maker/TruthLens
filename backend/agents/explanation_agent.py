import json
from typing import List
from models import ExplanationOutput, EvidenceItem
from llm import call_llm_json

SYSTEM_PROMPT = """You are the Explanation Agent for TruthLens.
Your job is to generate a short, simple, crystal-clear explanation (3-4 sentences) in the USER'S LANGUAGE (as specified by the ISO code).

Rules:
1. Write the explanation STRICTLY in the user's language (e.g. Hindi for 'hi', Marathi for 'mr', Tamil for 'ta', Telugu for 'te', Bengali for 'bn', English for 'en'). Do NOT default to English unless the requested language is 'en'.
2. Clearly explain:
   - What the verdict is (Supported / False / Misleading / Unverifiable).
   - What is true versus what is false or inaccurate.
   - Why, citing the official/credible sources examined.
3. Keep the tone objective, neutral, accessible, and reassuring.
"""

async def generate_explanation(
    claim: str,
    verdict: str,
    confidence: int,
    language: str,
    evidence: List[EvidenceItem]
) -> ExplanationOutput:
    evidence_summary = [
        {"domain": e.domain, "tier": e.tier, "stance": e.stance, "reason": e.reason}
        for e in evidence
    ]

    prompt = (
        f"Claim: \"{claim}\"\n"
        f"Verdict: {verdict}\n"
        f"Confidence: {confidence}%\n"
        f"User Language ISO: {language}\n"
        f"Evidence summary: {json.dumps(evidence_summary, indent=2)}\n\n"
        f"Generate the 3-4 sentence explanation strictly in the language '{language}'."
    )

    result = await call_llm_json(
        prompt=prompt,
        system_prompt=SYSTEM_PROMPT,
        response_model=ExplanationOutput
    )
    return result
