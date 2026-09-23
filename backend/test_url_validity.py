"""
Test script to validate that fallback URLs in research_agent are reachable.
This helps catch hallucinated URLs early.
"""

import asyncio
import httpx
from agents.research_agent import _generate_grounded_fallback_sources

VALID_STATUS_CODES = set(range(200, 400))


async def check_url(url: str) -> tuple[str, bool, int]:
    """Check if a URL is reachable."""
    try:
        async with httpx.AsyncClient(
            timeout=5.0,
            follow_redirects=True,
            headers={"User-Agent": "TruthLens/1.0"}
        ) as client:
            response = await client.head(url)
            is_valid = response.status_code in VALID_STATUS_CODES
            return (url, is_valid, response.status_code)
    except Exception as e:
        return (url, False, -1)


async def test_fallback_sources():
    """Test all fallback source URLs."""
    test_queries = [
        "500 रुपये नोट हरी पट्टी",
        "unesco anthem gana",
        "india t20 world cup 2024"
    ]

    print("[Testing Fallback URLs for Validity]\n")

    for query in test_queries:
        print(f"Query: {query}")
        sources = _generate_grounded_fallback_sources(query)
        
        for src in sources:
            url, is_valid, status = await check_url(src.url)
            status_str = f"HTTP {status}" if status > 0 else "Connection Error"
            result = "✓ OK" if is_valid else "✗ BROKEN"
            print(f"  {result} - {url} ({status_str})")
            print(f"       Title: {src.title[:60]}...")
        print()


if __name__ == "__main__":
    asyncio.run(test_fallback_sources())
