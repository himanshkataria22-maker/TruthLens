import asyncio
import json
from typing import List, Dict
from models import ExplanationOutput, MultiExplanationOutput, EvidenceItem, AgentExecutionError, AgentParsingError
from llm import call_llm_json, _heuristic_all_explanations

SUPPORTED_LANGS = ["en", "hi", "mr", "ta", "bn"]

LANGUAGE_HINTS: Dict[str, str] = {
    "en": "Write in clear English.",
    "hi": "Write in Hindi (हिन्दी) ONLY — use Hindi grammar and vocabulary (e.g. 'यह', 'है', 'गलत').",
    "mr": "Write in Marathi (मराठी) ONLY — NOT Hindi. Use Marathi grammar (e.g. 'हा', 'आहे', 'खोटा', 'नुसार', 'च्या').",
    "ta": "Write in Tamil (தமிழ்) ONLY — use Tamil script throughout.",
    "bn": "Write in Bengali (বাংলা) ONLY — use Bengali script throughout.",
}

SYSTEM_PROMPT = """You are the Explanation Agent for TruthLens.
Your job is to generate a short, simple, crystal-clear explanation (3-4 sentences) in the USER'S LANGUAGE (as specified by the ISO code).

Rules:
1. Write the explanation STRICTLY in the user's language (e.g. Hindi for 'hi', Marathi for 'mr', Tamil for 'ta', Bengali for 'bn', English for 'en'). Do NOT default to English unless the requested language is 'en'.
2. Marathi and Hindi are DIFFERENT languages — never copy Hindi text when Marathi is requested.
3. Clearly explain:
   - What the verdict is (Supported / False / Misleading / Unverifiable).
   - What is true versus what is false or inaccurate.
   - Why, citing the official/credible sources examined.
4. Keep the tone objective, neutral, accessible, and reassuring.
"""

MULTI_SYSTEM_PROMPT = """You are the Explanation Agent for TruthLens.
Generate short, simple, crystal-clear explanations (3-4 sentences each) for the verified claim in ALL 5 supported languages:
- 'en': English
- 'hi': Hindi (हिन्दी) — Hindi grammar only
- 'mr': Marathi (मराठी) — Marathi grammar only, NOT Hindi
- 'ta': Tamil (தமிழ்)
- 'bn': Bengali (বাংলা)

Each explanation MUST be written in its designated language with distinct wording and script conventions.
Return JSON: { "explanations": { "en": "...", "hi": "...", "mr": "...", "ta": "...", "bn": "..." } }
"""


def _normalize_text(text: str) -> str:
    return " ".join((text or "").split()).strip().lower()


def _langs_needing_regeneration(explanations_dict: Dict[str, str]) -> List[str]:
    """Find langs that are empty or duplicate another language's exact text."""
    seen: Dict[str, str] = {}
    need: List[str] = []
    for lang in SUPPORTED_LANGS:
        text = (explanations_dict.get(lang) or "").strip()
        if not text:
            need.append(lang)
            continue
        norm = _normalize_text(text)
        if norm in seen:
            need.append(lang)
        else:
            seen[norm] = lang
    return need


async def _generate_for_langs(
    claim: str,
    verdict: str,
    confidence: int,
    langs: List[str],
    evidence: List[EvidenceItem],
) -> Dict[str, str]:
    if not langs:
        return {}
    results = await asyncio.gather(
        *[
            generate_explanation(claim, verdict, confidence, lang, evidence)
            for lang in langs
        ],
        return_exceptions=True,
    )
    out: Dict[str, str] = {}
    for lang, result in zip(langs, results):
        if isinstance(result, ExplanationOutput) and result.explanation:
            out[lang] = result.explanation.strip()
        elif isinstance(result, Exception):
            print(f"[TruthLens WARNING] [ExplanationAgent] Failed for '{lang}': {result}")
    return out


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

    lang_key = (language or "en").lower()
    lang_hint = LANGUAGE_HINTS.get(lang_key, f"Write strictly in language '{lang_key}'.")

    prompt = (
        f"Claim: \"{claim}\"\n"
        f"Verdict: {verdict}\n"
        f"Confidence: {confidence}%\n"
        f"User Language ISO: {lang_key}\n"
        f"Language instruction: {lang_hint}\n"
        f"Evidence summary: {json.dumps(evidence_summary, indent=2)}\n\n"
        f"Generate the 3-4 sentence explanation strictly in the language '{lang_key}'."
    )

    try:
        result = await call_llm_json(
            prompt=prompt,
            system_prompt=SYSTEM_PROMPT,
            response_model=ExplanationOutput,
            agent_name="ExplanationAgent"
        )
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

    explanations_dict: Dict[str, str] = {}

    # Step 1: Try single multi-language LLM call (fast path)
    try:
        multi_result: MultiExplanationOutput = await call_llm_json(
            prompt=prompt,
            system_prompt=MULTI_SYSTEM_PROMPT,
            response_model=MultiExplanationOutput,
            agent_name="ExplanationAgent"
        )
        explanations_dict = {
            k.lower(): v.strip()
            for k, v in (multi_result.explanations or {}).items()
            if v and str(v).strip()
        }
        print(f"[TruthLens] [ExplanationAgent] Multi-language call succeeded. Keys: {list(explanations_dict.keys())}")
    except Exception as e:
        print(f"[TruthLens WARNING] [ExplanationAgent] Multi-language call failed: {e}")

    # Step 2: Regenerate missing OR duplicate texts per language
    need_regen = _langs_needing_regeneration(explanations_dict)
    if need_regen:
        print(f"[TruthLens] [ExplanationAgent] Regenerating langs (missing/duplicate): {need_regen}")
        regen = await _generate_for_langs(claim, verdict, confidence, need_regen, evidence)
        explanations_dict.update(regen)

    # Step 3: If still incomplete, parallel per-language calls for all 5
    still_need = _langs_needing_regeneration(explanations_dict)
    if len(explanations_dict) < len(SUPPORTED_LANGS) or still_need:
        print("[TruthLens] [ExplanationAgent] Falling back to full parallel per-language generation.")
        parallel = await _generate_for_langs(claim, verdict, confidence, SUPPORTED_LANGS, evidence)
        for lang in SUPPORTED_LANGS:
            if parallel.get(lang):
                explanations_dict[lang] = parallel[lang]

    # Step 4: Heuristic fill only for langs still missing/duplicated — never copy another lang's text
    still_need = _langs_needing_regeneration(explanations_dict)
    if still_need:
        heuristic = _heuristic_all_explanations(prompt)
        for lang in still_need:
            if heuristic.get(lang):
                explanations_dict[lang] = heuristic[lang]

    # Final dedupe pass with heuristics for any remaining duplicates
    for lang in _langs_needing_regeneration(explanations_dict):
        heuristic = _heuristic_all_explanations(prompt)
        if heuristic.get(lang):
            explanations_dict[lang] = heuristic[lang]

    primary_lang = (primary_language or "en").lower()
    primary_exp = (
        explanations_dict.get(primary_lang)
        or explanations_dict.get("en")
        or next(iter(explanations_dict.values()), f"The claim has been verified as {verdict}.")
    )

    # Ensure all keys are lowercase and valid
    final_explanations = {}
    for lang in SUPPORTED_LANGS:
        if lang in explanations_dict:
            final_explanations[lang] = explanations_dict[lang]
    
    print(f"[TruthLens] [ExplanationAgent] Final explanations dict keys: {list(final_explanations.keys())}")
    for lang in final_explanations:
        print(f"[TruthLens] [ExplanationAgent] {lang}: {final_explanations[lang][:60]}...")

    return ExplanationOutput(
        explanation=primary_exp,
        language=primary_lang,
        explanations=final_explanations,
    )
