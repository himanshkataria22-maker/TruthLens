import time
from typing import List, Optional
from models import (
    VerifyResponse,
    EvidenceItem,
    StepLog,
    ClaimExtractorOutput,
    VerificationOutput,
    ExplanationOutput,
    CredibleSource
)
from agents.claim_extractor import extract_claim
from agents.research_agent import research_queries
from agents.credibility_filter import filter_sources
from agents.verification_agent import verify_claim
from agents.explanation_agent import generate_explanation

async def run_pipeline(text: str) -> VerifyResponse:
    steps: List[StepLog] = []
    
    if not text or not text.strip():
        return VerifyResponse(
            claim="",
            language="en",
            verdict="UNVERIFIABLE",
            confidence=0,
            explanation="No claim text provided for verification.",
            evidence=[],
            steps=[]
        )

    try:
        # Step 1: Claim Extraction
        t0 = time.perf_counter()
        claim_data: ClaimExtractorOutput = await extract_claim(text)
        t1 = time.perf_counter()
        steps.append(StepLog(name="claim_extraction", duration_ms=int((t1 - t0) * 1000)))

        # Step 2: Web Research
        t0 = time.perf_counter()
        raw_sources = await research_queries(claim_data.queries)
        t1 = time.perf_counter()
        steps.append(StepLog(name="web_research", duration_ms=int((t1 - t0) * 1000)))

        # Step 3: Credibility Filtering
        t0 = time.perf_counter()
        credible_sources: List[CredibleSource] = filter_sources(raw_sources)
        t1 = time.perf_counter()
        steps.append(StepLog(name="credibility_filtering", duration_ms=int((t1 - t0) * 1000)))

        # Handle zero sources
        if not credible_sources:
            lang = claim_data.language
            exp_text = (
                "इस दावे के संबंध में कोई विश्वसनीय या आधिकारिक स्रोत नहीं मिले। इसलिए इसकी पुष्टि नहीं की जा सकी।"
                if lang == "hi"
                else "No credible or authoritative sources were found regarding this claim. Hence it remains unverifiable."
            )
            return VerifyResponse(
                claim=claim_data.claim,
                language=lang,
                verdict="UNVERIFIABLE",
                confidence=0,
                explanation=exp_text,
                evidence=[],
                steps=steps
            )

        # Step 4: Verification
        t0 = time.perf_counter()
        verification_data: VerificationOutput = await verify_claim(
            claim=claim_data.claim,
            sources=credible_sources
        )
        t1 = time.perf_counter()
        steps.append(StepLog(name="claim_verification", duration_ms=int((t1 - t0) * 1000)))

        # Build evidence items combining stance and credibility
        stance_map = {s.url: (s.stance, s.reason) for s in verification_data.per_source_stance}
        evidence_items: List[EvidenceItem] = []
        for src in credible_sources:
            st, rsn = stance_map.get(src.url, ("neutral", "Discusses relevant context."))
            evidence_items.append(EvidenceItem(
                title=src.title,
                url=src.url,
                domain=src.domain,
                tier=src.tier,
                stance=st,
                reason=rsn
            ))

        # Step 5: Explanation Generation
        t0 = time.perf_counter()
        explanation_data: ExplanationOutput = await generate_explanation(
            claim=claim_data.claim,
            verdict=verification_data.verdict,
            confidence=verification_data.confidence,
            language=claim_data.language,
            evidence=evidence_items
        )
        t1 = time.perf_counter()
        steps.append(StepLog(name="explanation_generation", duration_ms=int((t1 - t0) * 1000)))

        return VerifyResponse(
            claim=claim_data.claim,
            language=claim_data.language,
            verdict=verification_data.verdict,
            confidence=verification_data.confidence,
            explanation=explanation_data.explanation,
            evidence=evidence_items,
            steps=steps
        )

    except Exception as e:
        return VerifyResponse(
            claim=text[:100],
            language="en",
            verdict="UNVERIFIABLE",
            confidence=0,
            explanation=f"Verification pipeline encountered an issue: {str(e)}",
            evidence=[],
            steps=steps
        )
