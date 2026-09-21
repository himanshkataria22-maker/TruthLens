import json
import re
import os
from typing import Optional, Dict, Any
from models import VerifyResponse
import asyncio

DEMO_CACHE_PATH = os.path.join(os.path.dirname(__file__), "demo_cache.json")

def normalize_text(text: str) -> str:
    """Normalize text for matching: lowercase, remove punctuation, extra spaces."""
    text = text.lower()
    # Remove common filler words and punctuation
    text = re.sub(r"[^\w\s\u0900-\u097F]", " ", text)  # Keep Hindi/Devanagari characters
    text = re.sub(r"\s+", " ", text)
    text = text.strip()
    return text

def load_demo_cache() -> Dict[str, Any]:
    """Load demo cache from JSON file."""
    try:
        with open(DEMO_CACHE_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return {"claims": []}

def find_cached_claim(text: str, demo_mode: bool = False) -> Optional[Dict[str, Any]]:
    """
    Find a cached claim that matches the input text.
    Returns the cached result if found, None otherwise.
    
    In demo_mode=True, only return cache hits.
    In demo_mode=False, return cache hits if available (optimization).
    """
    normalized_input = normalize_text(text)
    cache = load_demo_cache()
    
    for cached_claim in cache.get("claims", []):
        cached_normalized = cached_claim.get("normalized_text", "")
        
        # Simple fuzzy matching: check if most key words overlap
        input_words = set(normalized_input.split())
        cached_words = set(cached_normalized.split())
        
        if len(input_words) == 0:
            continue
            
        # Calculate overlap
        common_words = input_words & cached_words
        overlap_ratio = len(common_words) / max(len(input_words), len(cached_words))
        
        # If >70% overlap, consider it a match
        if overlap_ratio > 0.7:
            return cached_claim.get("result")
    
    return None

async def stream_cached_result(result: Dict[str, Any]):
    """
    Generator that yields cached result as streaming events with small delays.
    This makes the demo look like the real pipeline.
    """
    steps = result.get("steps", [])
    
    for step in steps:
        await asyncio.sleep(0.3)  # Small delay to simulate processing
        yield {
            "step": step["name"],
            "status": "done",
            "duration_ms": step["duration_ms"]
        }
    
    # Final result
    yield {"step": "result", "data": result}
