from models import ClaimExtractorOutput
from llm import call_llm_json

SYSTEM_PROMPT = """You are the Claim Extraction Agent for TruthLens, an Indian & Global Fact-Checking platform.
Your job:
1. Detect the primary language of the user input and return the ISO 639-1 code (e.g. "hi" for Hindi, "en" for English, "mr" for Marathi, "ta" for Tamil, "bn" for Bengali, "te" for Telugu, etc.).
2. Extract the single core verifiable factual claim from the text. Remove all opinions, conversational greetings, emotional rhetoric, and forward text (e.g. "Forwarded as received", "Share with everyone", "100% true", "Alert everyone").
3. Generate exactly 3 targeted web search queries to verify this claim:
   - Query 1: In the user's input language.
   - Query 2: In English, focused on fact checking the claim.
   - Query 3: A neutral keyword query (entities + action + official sources e.g. "RBI", "PIB", "Govt").
"""

async def extract_claim(raw_text: str) -> ClaimExtractorOutput:
    prompt = f"User Input Text:\n{raw_text}\n\nExtract the core factual claim, language ISO code, and 3 search queries."
    result = await call_llm_json(
        prompt=prompt,
        system_prompt=SYSTEM_PROMPT,
        response_model=ClaimExtractorOutput
    )
    return result
