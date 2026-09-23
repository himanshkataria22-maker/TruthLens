"""
URL validation utility to verify that source URLs are reachable.
Performs concurrent HEAD requests to validate URLs before returning them to the user.
"""

import asyncio
import httpx
from typing import List, Tuple
from models import EvidenceItem

# Short timeout for HEAD requests
HEAD_REQUEST_TIMEOUT = 3.0
# Valid status codes (2xx and 3xx redirects)
VALID_STATUS_CODES = set(range(200, 400))


async def _check_url_reachable(url: str, timeout: float = HEAD_REQUEST_TIMEOUT) -> Tuple[str, bool]:
    """
    Check if a URL is reachable with a HEAD request.
    Returns: (url, is_reachable)
    """
    try:
        async with httpx.AsyncClient(
            timeout=timeout,
            follow_redirects=True,
            headers={"User-Agent": "TruthLens/1.0"}
        ) as client:
            response = await client.head(url)
            is_valid = response.status_code in VALID_STATUS_CODES
            return (url, is_valid)
    except Exception as e:
        print(f"[TruthLens URL Validator] HEAD request failed for {url}: {type(e).__name__}")
        return (url, False)


async def validate_evidence_urls(evidence_items: List[EvidenceItem]) -> List[EvidenceItem]:
    """
    Validate all evidence URLs concurrently.
    Removes evidence items with unreachable URLs.
    
    This validation is non-blocking and fast (~3 seconds for multiple URLs in parallel).
    """
    if not evidence_items:
        return evidence_items

    # Extract URLs to check
    urls_to_check = [item.url for item in evidence_items]

    # Perform concurrent HEAD requests
    try:
        tasks = [_check_url_reachable(url) for url in urls_to_check]
        results = await asyncio.gather(*tasks, return_exceptions=False)
        
        # Create a set of reachable URLs
        reachable_urls = {url for url, is_reachable in results if is_reachable}
        
        # Filter evidence to only include items with reachable URLs
        validated_evidence = [
            item for item in evidence_items 
            if item.url in reachable_urls
        ]
        
        # Log validation results
        removed_count = len(evidence_items) - len(validated_evidence)
        if removed_count > 0:
            print(f"[TruthLens URL Validator] Removed {removed_count} unreachable source(s)")
        
        return validated_evidence
    except Exception as e:
        print(f"[TruthLens URL Validator] Exception during URL validation: {e}")
        # If validation fails, return original evidence (safety: don't lose data)
        return evidence_items
