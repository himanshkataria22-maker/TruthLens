"""
Simple in-memory cache for verification results.
Normalized claim text is used as the cache key.
Results are stored with a timestamp and expire after 24 hours.
"""

import time
import hashlib
import re
from typing import Optional, Dict, Any, Tuple
from models import VerifyResponse

# Global in-memory cache
# Structure: {normalized_claim_hash: (timestamp, target_language, VerifyResponse)}
_CACHE: Dict[str, Tuple[float, Optional[str], VerifyResponse]] = {}

CACHE_TTL_SECONDS = 24 * 60 * 60  # 24 hours


def normalize_claim(text: str) -> str:
    """
    Normalize claim text for consistent cache key generation.
    Converts to lowercase, strips whitespace, collapses multiple spaces.
    """
    # Convert to lowercase
    normalized = text.lower()
    # Strip leading/trailing whitespace
    normalized = normalized.strip()
    # Collapse multiple whitespaces into single space
    normalized = re.sub(r'\s+', ' ', normalized)
    return normalized


def get_cache_key(text: str, target_language: Optional[str] = None) -> str:
    """
    Generate a consistent cache key from claim text and language.
    Uses SHA256 hash for compact key representation.
    """
    normalized = normalize_claim(text)
    # Include target_language in key to allow different results per language
    key_input = f"{normalized}|{target_language or 'none'}"
    return hashlib.sha256(key_input.encode()).hexdigest()


def get_cached_result(text: str, target_language: Optional[str] = None) -> Optional[VerifyResponse]:
    """
    Retrieve a cached result if it exists and is still valid (< 24 hours old).
    Returns None if cache miss or entry expired.
    """
    cache_key = get_cache_key(text, target_language)
    
    if cache_key not in _CACHE:
        return None
    
    timestamp, cached_lang, response = _CACHE[cache_key]
    current_time = time.time()
    
    # Check if cache entry has expired
    if current_time - timestamp > CACHE_TTL_SECONDS:
        # Remove expired entry
        del _CACHE[cache_key]
        return None
    
    print(f"[TruthLens Cache] HIT: {normalize_claim(text)[:50]}... (age: {int(current_time - timestamp)}s)")
    return response


def cache_result(text: str, response: VerifyResponse, target_language: Optional[str] = None) -> None:
    """
    Store a verification result in the cache with current timestamp.
    """
    cache_key = get_cache_key(text, target_language)
    current_time = time.time()
    _CACHE[cache_key] = (current_time, target_language, response)
    
    print(f"[TruthLens Cache] STORE: {normalize_claim(text)[:50]}... (key: {cache_key[:16]}...)")
    print(f"[TruthLens Cache] Current cache size: {len(_CACHE)} entries")


def clear_cache() -> None:
    """Clear all cached entries. Useful for testing."""
    global _CACHE
    _CACHE.clear()
    print("[TruthLens Cache] Cache cleared.")


def get_cache_stats() -> Dict[str, Any]:
    """Return cache statistics for debugging."""
    current_time = time.time()
    expired_count = 0
    valid_count = 0
    
    for cache_key, (timestamp, lang, _) in _CACHE.items():
        if current_time - timestamp > CACHE_TTL_SECONDS:
            expired_count += 1
        else:
            valid_count += 1
    
    return {
        "total_entries": len(_CACHE),
        "valid_entries": valid_count,
        "expired_entries": expired_count,
        "ttl_hours": CACHE_TTL_SECONDS // 3600,
    }
