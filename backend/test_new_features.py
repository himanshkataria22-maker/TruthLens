#!/usr/bin/env python3
"""Quick test for new features added to TruthLens."""
import sys
sys.stdout.reconfigure(encoding='utf-8')
import asyncio
import json
from demo_cache import find_cached_claim, normalize_text

async def test_demo_cache():
    """Test demo cache lookup."""
    print("\n" + "=" * 70)
    print("Testing Demo Cache")
    print("=" * 70)
    
    test_texts = [
        "सावधान! 500 रुपये के नोट पर हरी पट्टी अगर गांधी जी की तस्वीर के पास नहीं है बल्कि गवर्नर के हस्ताक्षर के पास है तो वह नोट पूरी तरह से नकली है।",
        "UNESCO has officially declared the Indian National Anthem Jana Gana Mana as the best national anthem in the world.",
        "India won the ICC Men's T20 World Cup in June 2024 by defeating South Africa in Barbados.",
        "This is a totally new claim that shouldn't be cached"
    ]
    
    for text in test_texts:
        cached = find_cached_claim(text)
        if cached:
            print(f"✓ Cache HIT: {text[:60]}...")
            print(f"  Verdict: {cached['verdict']}, Confidence: {cached['confidence']}%")
        else:
            print(f"✗ Cache MISS: {text[:60]}...")
    
    print("=" * 70)

async def test_normalization():
    """Test text normalization."""
    print("\n" + "=" * 70)
    print("Testing Text Normalization")
    print("=" * 70)
    
    test_cases = [
        ("500 रुपये के नोट पर हरी पट्टी!!!", "500 rupee note green strip"),
        ("UNESCO declared Indian anthem best", "unesco indian anthem best"),
    ]
    
    for original, expected_fragment in test_cases:
        normalized = normalize_text(original)
        print(f"Original:   {original}")
        print(f"Normalized: {normalized}")
        print(f"Contains '{expected_fragment}': {expected_fragment in normalized}")
        print()
    
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(test_demo_cache())
    asyncio.run(test_normalization())
    print("\n✓ All feature tests completed!")
