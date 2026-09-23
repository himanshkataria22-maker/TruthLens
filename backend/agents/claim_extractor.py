from models import ClaimExtractorOutput, AgentExecutionError, AgentParsingError
from llm import call_llm_json

SYSTEM_PROMPT = """You are the Claim Extraction Agent for TruthLens, an Indian & Global Fact-Checking platform.
Your job:
1. Detect the primary language of the user input and return the ISO 639-1 code (e.g. "hi" for Hindi, "en" for English, "mr" for Marathi, "ta" for Tamil, "bn" for Bengali, "te" for Telugu, etc.).
2. Extract the single core verifiable factual claim from the text. Remove all opinions, conversational greetings, emotional rhetoric, and forward text (e.g. "Forwarded as received", "Share with everyone", "100% true", "Alert everyone").
3. Classify the claim type (one of: "historical", "scientific", "current", "financial", "health", "general"):
   - "historical": Claims about past events, battles, historical figures, ancient facts (e.g., "Second Battle of Panipat was in 1556")
   - "scientific": Claims about scientific facts, medical claims, space/physics (e.g., "Gravity works as Newton described")
   - "current": Current political, diplomatic, breaking news claims (e.g., "India won T20 World Cup 2024")
   - "financial": Economic claims, stock market, inflation, prices
   - "health": Medical advice, disease claims, vaccine information
   - "general": General knowledge, sports (non-current), entertainment, general facts
4. Generate exactly 3 targeted web search queries to verify this claim:
   - Query 1: In the user's input language.
   - Query 2: In English, focused on fact checking the claim.
   - Query 3: A neutral keyword query (entities + action + official sources e.g. "RBI", "PIB", "Govt").
"""

async def extract_claim(raw_text: str) -> ClaimExtractorOutput:
    prompt = f"User Input Text:\n{raw_text}\n\nExtract the core factual claim, language ISO code, and 3 search queries."
    try:
        result = await call_llm_json(
            prompt=prompt,
            system_prompt=SYSTEM_PROMPT,
            response_model=ClaimExtractorOutput,
            agent_name="ClaimExtractorAgent"
        )
        return result
    except (AgentParsingError, AgentExecutionError):
        raise
    except Exception as e:
        print(f"[TruthLens ERROR] [ClaimExtractorAgent] Failed to extract claim. Input: '{raw_text[:100]}...'. Error: {str(e)}")
        raise AgentExecutionError(
            agent_name="ClaimExtractorAgent",
            message=f"Claim Extraction Agent failed: {str(e)}",
            raw_response=None
        )
