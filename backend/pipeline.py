import asyncio
import time
from typing import List, Optional, AsyncGenerator, Dict, Any
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
from agents.explanation_agent import generate_explanation, generate_all_explanations
from cache import get_cached_result, cache_result

AGENT_TIMEOUT = 20.0  # 20 seconds hard timeout per agent call
PIPELINE_TIMEOUT = 45.0  # 45 seconds overall pipeline hard timeout

async def run_pipeline(text: str, target_language: Optional[str] = None) -> VerifyResponse:
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

    # Check cache first
    cached_result = get_cached_result(text, target_language)
    if cached_result:
        # Mark as cached and return immediately
        cached_result.cached = True
        return cached_result

    try:
        result = await asyncio.wait_for(
            _run_pipeline_inner(text, target_language),
            timeout=PIPELINE_TIMEOUT
        )
        # Store in cache after successful run
        cache_result(text, result, target_language)
        return result
    except asyncio.TimeoutError:
        print("[TruthLens ERROR] [Pipeline] Overall pipeline timed out after 45 seconds.")
        return VerifyResponse(
            claim=text[:100],
            language="en",
            verdict="UNVERIFIABLE",
            confidence=0,
            explanation="Verification pipeline timed out after 45 seconds. Please try again.",
            evidence=[],
            steps=[]
        )

async def _run_pipeline_inner(text: str, target_language: Optional[str] = None) -> VerifyResponse:
    steps: List[StepLog] = []

    # Step 1: Claim Extraction
    try:
        t0 = time.perf_counter()
        claim_data: ClaimExtractorOutput = await asyncio.wait_for(
            extract_claim(text),
            timeout=AGENT_TIMEOUT
        )
        t1 = time.perf_counter()
        steps.append(StepLog(name="claim_extraction", duration_ms=int((t1 - t0) * 1000)))
    except asyncio.TimeoutError:
        print("[TruthLens ERROR] [claim_extraction] Agent timed out after 20s.")
        return VerifyResponse(
            claim=text[:100],
            language="en",
            verdict="UNVERIFIABLE",
            confidence=0,
            explanation="[claim_extraction] This step took too long. Please try again.",
            evidence=[],
            steps=steps
        )
    except Exception as e:
        print(f"[TruthLens ERROR] Pipeline early exit at stage 'claim_extraction': {str(e)}")
        return VerifyResponse(
            claim=text[:100],
            language="en",
            verdict="UNVERIFIABLE",
            confidence=0,
            explanation=f"[claim_extraction] {str(e)}",
            evidence=[],
            steps=steps
        )

    # Step 2: Web Research
    try:
        t0 = time.perf_counter()
        raw_sources = await asyncio.wait_for(
            research_queries(claim_data.queries),
            timeout=AGENT_TIMEOUT
        )
        t1 = time.perf_counter()
        steps.append(StepLog(name="web_research", duration_ms=int((t1 - t0) * 1000)))
    except asyncio.TimeoutError:
        print("[TruthLens ERROR] [web_research] Agent timed out after 20s.")
        return VerifyResponse(
            claim=claim_data.claim,
            language=claim_data.language,
            verdict="UNVERIFIABLE",
            confidence=0,
            explanation="[web_research] This step took too long. Please try again.",
            evidence=[],
            steps=steps
        )
    except Exception as e:
        print(f"[TruthLens ERROR] Pipeline early exit at stage 'web_research': {str(e)}")
        return VerifyResponse(
            claim=claim_data.claim,
            language=claim_data.language,
            verdict="UNVERIFIABLE",
            confidence=0,
            explanation=f"[web_research] {str(e)}",
            evidence=[],
            steps=steps
        )

    # Step 3: Credibility Filtering
    try:
        t0 = time.perf_counter()
        credible_sources: List[CredibleSource] = filter_sources(raw_sources)
        t1 = time.perf_counter()
        steps.append(StepLog(name="credibility_filtering", duration_ms=int((t1 - t0) * 1000)))
    except Exception as e:
        print(f"[TruthLens ERROR] Pipeline early exit at stage 'credibility_filtering': {str(e)}")
        return VerifyResponse(
            claim=claim_data.claim,
            language=claim_data.language,
            verdict="UNVERIFIABLE",
            confidence=0,
            explanation=f"[credibility_filtering] {str(e)}",
            evidence=[],
            steps=steps
        )

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
    try:
        t0 = time.perf_counter()
        verification_data: VerificationOutput = await asyncio.wait_for(
            verify_claim(claim=claim_data.claim, sources=credible_sources),
            timeout=AGENT_TIMEOUT
        )
        t1 = time.perf_counter()
        steps.append(StepLog(name="claim_verification", duration_ms=int((t1 - t0) * 1000)))
    except asyncio.TimeoutError:
        print("[TruthLens ERROR] [claim_verification] Agent timed out after 20s.")
        return VerifyResponse(
            claim=claim_data.claim,
            language=claim_data.language,
            verdict="UNVERIFIABLE",
            confidence=0,
            explanation="[claim_verification] This step took too long. Please try again.",
            evidence=[],
            steps=steps
        )
    except Exception as e:
        print(f"[TruthLens ERROR] Pipeline early exit at stage 'claim_verification': {str(e)}")
        return VerifyResponse(
            claim=claim_data.claim,
            language=claim_data.language,
            verdict="UNVERIFIABLE",
            confidence=0,
            explanation=f"[claim_verification] {str(e)}",
            evidence=[],
            steps=steps
        )

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
    try:
        t0 = time.perf_counter()
        explanation_language = target_language if target_language else claim_data.language
        explanation_data: ExplanationOutput = await asyncio.wait_for(
            generate_all_explanations(
                claim=claim_data.claim,
                verdict=verification_data.verdict,
                confidence=verification_data.confidence,
                primary_language=explanation_language,
                evidence=evidence_items
            ),
            timeout=AGENT_TIMEOUT
        )
        t1 = time.perf_counter()
        steps.append(StepLog(name="explanation_generation", duration_ms=int((t1 - t0) * 1000)))

        return VerifyResponse(
            claim=claim_data.claim,
            language=claim_data.language,
            verdict=verification_data.verdict,
            confidence=verification_data.confidence,
            explanation=explanation_data.explanation,
            explanations=explanation_data.explanations,
            evidence=evidence_items,
            steps=steps
        )
    except asyncio.TimeoutError:
        print("[TruthLens ERROR] [explanation_generation] Agent timed out after 20s.")
        fallback_exp = f"The claim '{claim_data.claim}' has been verified as {verification_data.verdict} with {verification_data.confidence}% confidence."
        fallback_dict = {lang: fallback_exp for lang in ["en", "hi", "mr", "ta", "bn"]}
        return VerifyResponse(
            claim=claim_data.claim,
            language=claim_data.language,
            verdict=verification_data.verdict,
            confidence=verification_data.confidence,
            explanation=fallback_exp,
            explanations=fallback_dict,
            evidence=evidence_items,
            steps=steps
        )
    except Exception as e:
        print(f"[TruthLens ERROR] Pipeline early exit at stage 'explanation_generation': {str(e)}")
        fallback_exp = f"The claim '{claim_data.claim}' has been verified as {verification_data.verdict} with {verification_data.confidence}% confidence."
        fallback_dict = {lang: fallback_exp for lang in ["en", "hi", "mr", "ta", "bn"]}
        return VerifyResponse(
            claim=claim_data.claim,
            language=claim_data.language,
            verdict=verification_data.verdict,
            confidence=verification_data.confidence,
            explanation=fallback_exp,
            explanations=fallback_dict,
            evidence=evidence_items,
            steps=steps
        )


async def run_pipeline_streaming(text: str, target_language: Optional[str] = None) -> AsyncGenerator[Dict[str, Any], None]:
    """
    Run the verification pipeline with real-time step events.
    Yields SSE-compatible events as each step completes.
    Final event contains the full result.
    Enforces 20s per-agent timeout & 45s overall pipeline timeout.
    """
    if not text or not text.strip():
        result = VerifyResponse(
            claim="",
            language="en",
            verdict="UNVERIFIABLE",
            confidence=0,
            explanation="No claim text provided for verification.",
            evidence=[],
            steps=[]
        )
        yield {"step": "result", "data": result.model_dump()}
        return

    # Check cache first
    cached_result = get_cached_result(text, target_language)
    if cached_result:
        # Mark as cached and yield immediately without running full pipeline
        cached_result.cached = True
        print("[TruthLens] Returning cached result, skipping full pipeline.")
        yield {"step": "result", "data": cached_result.model_dump(), "cached": True}
        return

    steps: List[StepLog] = []
    overall_start_time = time.perf_counter()

    # Step 1: Claim Extraction
    try:
        t0 = time.perf_counter()
        claim_data: ClaimExtractorOutput = await asyncio.wait_for(
            extract_claim(text),
            timeout=AGENT_TIMEOUT
        )
        t1 = time.perf_counter()
        duration_1 = int((t1 - t0) * 1000)
        steps.append(StepLog(name="claim_extraction", duration_ms=duration_1))
        yield {"step": "claim_extraction", "status": "done", "duration_ms": duration_1}
    except asyncio.TimeoutError:
        print("[TruthLens ERROR] [claim_extraction] Agent timed out after 20s.")
        yield {"error": True, "stage": "claim_extraction", "message": "This step took too long. Please try again."}
        err_res = VerifyResponse(
            claim=text[:100],
            language="en",
            verdict="UNVERIFIABLE",
            confidence=0,
            explanation="[claim_extraction] This step took too long. Please try again.",
            evidence=[],
            steps=steps
        )
        yield {"step": "result", "data": err_res.model_dump()}
        return
    except Exception as e:
        print(f"[TruthLens ERROR] PipelineStream early exit at stage 'claim_extraction': {str(e)}")
        yield {"error": True, "stage": "claim_extraction", "message": f"[ClaimExtractorAgent] {str(e)}"}
        err_res = VerifyResponse(
            claim=text[:100],
            language="en",
            verdict="UNVERIFIABLE",
            confidence=0,
            explanation=f"[ClaimExtractorAgent] {str(e)}",
            evidence=[],
            steps=steps
        )
        yield {"step": "result", "data": err_res.model_dump()}
        return

    # Check overall timeout (45s limit)
    if time.perf_counter() - overall_start_time > PIPELINE_TIMEOUT:
        print("[TruthLens ERROR] [PipelineStream] Overall pipeline timeout exceeded.")
        yield {"error": True, "stage": "pipeline", "message": "Verification pipeline timed out after 45s. Please try again."}
        return

    # Step 2: Web Research
    try:
        t0 = time.perf_counter()
        raw_sources = await asyncio.wait_for(
            research_queries(claim_data.queries),
            timeout=AGENT_TIMEOUT
        )
        t1 = time.perf_counter()
        duration_2 = int((t1 - t0) * 1000)
        steps.append(StepLog(name="web_research", duration_ms=duration_2))
        yield {"step": "web_research", "status": "done", "duration_ms": duration_2}
    except asyncio.TimeoutError:
        print("[TruthLens ERROR] [web_research] Agent timed out after 20s.")
        yield {"error": True, "stage": "web_research", "message": "This step took too long. Please try again."}
        err_res = VerifyResponse(
            claim=claim_data.claim,
            language=claim_data.language,
            verdict="UNVERIFIABLE",
            confidence=0,
            explanation="[web_research] This step took too long. Please try again.",
            evidence=[],
            steps=steps
        )
        yield {"step": "result", "data": err_res.model_dump()}
        return
    except Exception as e:
        print(f"[TruthLens ERROR] PipelineStream early exit at stage 'web_research': {str(e)}")
        yield {"error": True, "stage": "web_research", "message": f"[ResearchAgent] {str(e)}"}
        err_res = VerifyResponse(
            claim=claim_data.claim,
            language=claim_data.language,
            verdict="UNVERIFIABLE",
            confidence=0,
            explanation=f"[ResearchAgent] {str(e)}",
            evidence=[],
            steps=steps
        )
        yield {"step": "result", "data": err_res.model_dump()}
        return

    # Check overall timeout (45s limit)
    if time.perf_counter() - overall_start_time > PIPELINE_TIMEOUT:
        print("[TruthLens ERROR] [PipelineStream] Overall pipeline timeout exceeded.")
        yield {"error": True, "stage": "pipeline", "message": "Verification pipeline timed out after 45s. Please try again."}
        return

    # Step 3: Credibility Filtering
    try:
        t0 = time.perf_counter()
        credible_sources: List[CredibleSource] = filter_sources(raw_sources)
        t1 = time.perf_counter()
        duration_3 = int((t1 - t0) * 1000)
        steps.append(StepLog(name="credibility_filtering", duration_ms=duration_3))
        yield {"step": "credibility_filtering", "status": "done", "duration_ms": duration_3}
    except Exception as e:
        print(f"[TruthLens ERROR] PipelineStream early exit at stage 'credibility_filtering': {str(e)}")
        yield {"error": True, "stage": "credibility_filtering", "message": f"[CredibilityFilterAgent] {str(e)}"}
        err_res = VerifyResponse(
            claim=claim_data.claim,
            language=claim_data.language,
            verdict="UNVERIFIABLE",
            confidence=0,
            explanation=f"[CredibilityFilterAgent] {str(e)}",
            evidence=[],
            steps=steps
        )
        yield {"step": "result", "data": err_res.model_dump()}
        return

    if not credible_sources:
        lang = claim_data.language
        exp_text = (
            "इस दावे के संबंध में कोई विश्वसनीय या आधिकारिक स्रोत नहीं मिले। इसलिए इसकी पुष्टि नहीं की जा सकी।"
            if lang == "hi"
            else "No credible or authoritative sources were found regarding this claim. Hence it remains unverifiable."
        )
        result = VerifyResponse(
            claim=claim_data.claim,
            language=lang,
            verdict="UNVERIFIABLE",
            confidence=0,
            explanation=exp_text,
            evidence=[],
            steps=steps
        )
        yield {"step": "result", "data": result.model_dump()}
        return

    # Step 4: Verification
    try:
        t0 = time.perf_counter()
        verification_data: VerificationOutput = await asyncio.wait_for(
            verify_claim(claim=claim_data.claim, sources=credible_sources),
            timeout=AGENT_TIMEOUT
        )
        t1 = time.perf_counter()
        duration_4 = int((t1 - t0) * 1000)
        steps.append(StepLog(name="claim_verification", duration_ms=duration_4))
        yield {"step": "claim_verification", "status": "done", "duration_ms": duration_4}
    except asyncio.TimeoutError:
        print("[TruthLens ERROR] [claim_verification] Agent timed out after 20s.")
        yield {"error": True, "stage": "claim_verification", "message": "This step took too long. Please try again."}
        err_res = VerifyResponse(
            claim=claim_data.claim,
            language=claim_data.language,
            verdict="UNVERIFIABLE",
            confidence=0,
            explanation="[claim_verification] This step took too long. Please try again.",
            evidence=[],
            steps=steps
        )
        yield {"step": "result", "data": err_res.model_dump()}
        return
    except Exception as e:
        print(f"[TruthLens ERROR] PipelineStream early exit at stage 'claim_verification': {str(e)}")
        yield {"error": True, "stage": "claim_verification", "message": f"[VerificationAgent] {str(e)}"}
        err_res = VerifyResponse(
            claim=claim_data.claim,
            language=claim_data.language,
            verdict="UNVERIFIABLE",
            confidence=0,
            explanation=f"[VerificationAgent] {str(e)}",
            evidence=[],
            steps=steps
        )
        yield {"step": "result", "data": err_res.model_dump()}
        return

    # Build evidence items
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

    # Check overall timeout (45s limit)
    if time.perf_counter() - overall_start_time > PIPELINE_TIMEOUT:
        print("[TruthLens ERROR] [PipelineStream] Overall pipeline timeout exceeded.")
        yield {"error": True, "stage": "pipeline", "message": "Verification pipeline timed out after 45s. Please try again."}
        return

    # Step 5: Explanation Generation
    try:
        t0 = time.perf_counter()
        explanation_language = target_language if target_language else claim_data.language
        explanation_data: ExplanationOutput = await asyncio.wait_for(
            generate_all_explanations(
                claim=claim_data.claim,
                verdict=verification_data.verdict,
                confidence=verification_data.confidence,
                primary_language=explanation_language,
                evidence=evidence_items
            ),
            timeout=AGENT_TIMEOUT
        )
        t1 = time.perf_counter()
        duration_5 = int((t1 - t0) * 1000)
        steps.append(StepLog(name="explanation_generation", duration_ms=duration_5))
        yield {"step": "explanation_generation", "status": "done", "duration_ms": duration_5}

        result = VerifyResponse(
            claim=claim_data.claim,
            language=claim_data.language,
            verdict=verification_data.verdict,
            confidence=verification_data.confidence,
            explanation=explanation_data.explanation,
            explanations=explanation_data.explanations,
            evidence=evidence_items,
            steps=steps
        )
        # Cache the result
        cache_result(text, result, target_language)
        yield {"step": "result", "data": result.model_dump()}

    except asyncio.TimeoutError:
        print("[TruthLens ERROR] [explanation_generation] Agent timed out after 20s.")
        fallback_exp = f"The claim '{claim_data.claim}' has been verified as {verification_data.verdict} with {verification_data.confidence}% confidence."
        fallback_dict = {lang: fallback_exp for lang in ["en", "hi", "mr", "ta", "bn"]}
        result = VerifyResponse(
            claim=claim_data.claim,
            language=claim_data.language,
            verdict=verification_data.verdict,
            confidence=verification_data.confidence,
            explanation=fallback_exp,
            explanations=fallback_dict,
            evidence=evidence_items,
            steps=steps
        )
        yield {"step": "result", "data": result.model_dump()}

    except Exception as e:
        print(f"[TruthLens ERROR] PipelineStream early exit at stage 'explanation_generation': {str(e)}")
        fallback_exp = f"The claim '{claim_data.claim}' has been verified as {verification_data.verdict} with {verification_data.confidence}% confidence."
        fallback_dict = {lang: fallback_exp for lang in ["en", "hi", "mr", "ta", "bn"]}
        result = VerifyResponse(
            claim=claim_data.claim,
            language=claim_data.language,
            verdict=verification_data.verdict,
            confidence=verification_data.confidence,
            explanation=fallback_exp,
            explanations=fallback_dict,
            evidence=evidence_items,
            steps=steps
        )
        yield {"step": "result", "data": result.model_dump()}
