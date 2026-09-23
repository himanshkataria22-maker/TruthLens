import json
from typing import List, Dict
from models import ExplanationOutput, MultiExplanationOutput, EvidenceItem, AgentExecutionError, AgentParsingError
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

MULTI_SYSTEM_PROMPT = """You are the Explanation Agent for TruthLens.
Your job is to generate short, simple, crystal-clear explanations (3-4 sentences each) for the verified claim in ALL 5 supported languages:
- 'en': English
- 'hi': Hindi (हिन्दी)
- 'mr': Marathi (मराठी)
- 'ta': Tamil (தமிழ்)
- 'bn': Bengali (বাংলা)

Rules:
1. Write each explanation STRICTLY in its designated language.
2. Clearly explain:
   - What the verdict is (Supported / False / Misleading / Unverifiable).
   - What is true versus what is false or inaccurate.
   - Why, citing the official/credible sources examined.
3. Keep the tone objective, neutral, accessible, and reassuring.
4. Return a JSON object with key 'explanations' containing dictionary mappings for all 5 ISO language keys: 'en', 'hi', 'mr', 'ta', 'bn'.
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

    try:
        result = await call_llm_json(
            prompt=prompt,
            system_prompt=SYSTEM_PROMPT,
            response_model=ExplanationOutput,
            agent_name="ExplanationAgent"
        )
        if not result.explanations and result.explanation:
            result.explanations = {language: result.explanation}
        return result
    except (AgentParsingError, AgentExecutionError):
        raise
    except Exception as e:
        print(f"[TruthLens ERROR] [ExplanationAgent] Explanation generation failed. Claim: '{claim[:100]}...'. Error: {str(e)}")
        raise AgentExecutionError(
            agent_name="ExplanationAgent",
            message=f"Explanation Agent failed: {str(e)}",
            raw_response=None
        )

async def generate_all_explanations(
    claim: str,
    verdict: str,
    confidence: int,
    primary_language: str,
    evidence: List[EvidenceItem]
) -> ExplanationOutput:
    """Generate explanations in all 5 supported languages (en, hi, mr, ta, bn) upfront."""
    evidence_summary = [
        {"domain": e.domain, "tier": e.tier, "stance": e.stance, "reason": e.reason}
        for e in evidence
    ]

    prompt = (
        f"Claim: \"{claim}\"\n"
        f"Verdict: {verdict}\n"
        f"Confidence: {confidence}%\n"
        f"Primary Language ISO: {primary_language}\n"
        f"Evidence summary: {json.dumps(evidence_summary, indent=2)}\n\n"
        f"Generate crystal-clear 3-4 sentence explanations for all 5 languages: 'en', 'hi', 'mr', 'ta', 'bn'."
    )

    supported_langs = ["en", "hi", "mr", "ta", "bn"]

    try:
        multi_result: MultiExplanationOutput = await call_llm_json(
            prompt=prompt,
            system_prompt=MULTI_SYSTEM_PROMPT,
            response_model=MultiExplanationOutput,
            agent_name="ExplanationAgent"
        )
        explanations_dict = multi_result.explanations or {}
        
        # Ensure all 5 keys exist; fill missing keys if any
        fallback_text = explanations_dict.get(primary_language) or explanations_dict.get("en") or f"The claim '{claim}' has been verified as {verdict} with {confidence}% confidence."
        for lang in supported_langs:
            if lang not in explanations_dict or not explanations_dict[lang]:
                explanations_dict[lang] = fallback_text

        primary_exp = explanations_dict.get(primary_language) or explanations_dict.get("en") or fallback_text

        return ExplanationOutput(
            explanation=primary_exp,
            language=primary_language,
            explanations=explanations_dict
        )
    except Exception as e:
        print(f"[TruthLens WARNING] [ExplanationAgent] Multi-language generation failed ({str(e)}), falling back to single language.")
        # Fall back to single language call
        try:
            single_result = await generate_explanation(claim, verdict, confidence, primary_language, evidence)
            fallback_exp = single_result.explanation
            explanations_dict = {lang: fallback_exp for lang in supported_langs}
            explanations_dict[primary_language] = fallback_exp
            return ExplanationOutput(
                explanation=fallback_exp,
                language=primary_language,
                explanations=explanations_dict
            )
        except Exception as inner_e:
            fallback_exp = f"The claim '{claim}' has been verified as {verdict} with {confidence}% confidence."
            explanations_dict = {lang: fallback_exp for lang in supported_langs}
            return ExplanationOutput(
                explanation=fallback_exp,
                language=primary_language,
                explanations=explanations_dict
            )

