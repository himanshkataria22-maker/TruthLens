import asyncio
import json
from typing import List, Dict
from models import ExplanationOutput, MultiExplanationOutput, EvidenceItem, AgentExecutionError, AgentParsingError
from llm import call_llm_json, _heuristic_all_explanations

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
        lang_key = (language or "en").lower()
        if not result.explanations and result.explanation:
            result.explanations = {lang_key: result.explanation}
        elif result.explanations:
            result.explanations = {k.lower(): v for k, v in result.explanations.items()}
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
        explanations_dict = {
            k.lower(): v for k, v in (multi_result.explanations or {}).items() if v
        }

        missing_langs = [
            lang for lang in supported_langs
            if lang not in explanations_dict or not str(explanations_dict[lang]).strip()
        ]
        if missing_langs:
            per_lang_results = await asyncio.gather(
                *[
                    generate_explanation(claim, verdict, confidence, lang, evidence)
                    for lang in missing_langs
                ],
                return_exceptions=True,
            )
            for lang, result in zip(missing_langs, per_lang_results):
                if isinstance(result, ExplanationOutput) and result.explanation:
                    explanations_dict[lang] = result.explanation

        fallback_text = (
            explanations_dict.get("en")
            or explanations_dict.get(primary_language)
            or f"The claim '{claim}' has been verified as {verdict} with {confidence}% confidence."
        )
        still_missing = [
            lang for lang in supported_langs
            if lang not in explanations_dict or not str(explanations_dict[lang]).strip()
        ]
        if still_missing:
            heuristic = _heuristic_all_explanations(prompt)
            for lang in still_missing:
                explanations_dict[lang] = (
                    heuristic.get(lang)
                    or explanations_dict.get("en")
                    or fallback_text
                )

        primary_exp = explanations_dict.get(primary_language) or explanations_dict.get("en") or fallback_text

        return ExplanationOutput(
            explanation=primary_exp,
            language=primary_language,
            explanations=explanations_dict
        )
    except Exception as e:
        print(f"[TruthLens WARNING] [ExplanationAgent] Multi-language generation failed ({str(e)}), falling back to per-language calls.")
        try:
            per_lang_results = await asyncio.gather(
                *[
                    generate_explanation(claim, verdict, confidence, lang, evidence)
                    for lang in supported_langs
                ],
                return_exceptions=True,
            )
            explanations_dict: Dict[str, str] = {}
            for lang, result in zip(supported_langs, per_lang_results):
                if isinstance(result, ExplanationOutput) and result.explanation:
                    explanations_dict[lang] = result.explanation
                elif isinstance(result, Exception):
                    print(f"[TruthLens WARNING] [ExplanationAgent] Failed for '{lang}': {result}")

            if not explanations_dict:
                raise AgentExecutionError(
                    agent_name="ExplanationAgent",
                    message="All per-language explanation calls failed",
                )

            for lang in supported_langs:
                if lang not in explanations_dict:
                    explanations_dict[lang] = (
                        explanations_dict.get(primary_language)
                        or explanations_dict.get("en")
                        or next(iter(explanations_dict.values()))
                    )

            primary_exp = explanations_dict.get(primary_language) or explanations_dict.get("en") or next(iter(explanations_dict.values()))
            return ExplanationOutput(
                explanation=primary_exp,
                language=primary_language,
                explanations=explanations_dict,
            )
        except Exception as inner_e:
            print(f"[TruthLens ERROR] [ExplanationAgent] Per-language fallback failed: {inner_e}")
            fallback_exp = f"The claim '{claim}' has been verified as {verdict} with {confidence}% confidence."
            explanations_dict = {lang: fallback_exp for lang in supported_langs}
            return ExplanationOutput(
                explanation=fallback_exp,
                language=primary_language,
                explanations=explanations_dict
            )

