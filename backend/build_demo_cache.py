#!/usr/bin/env python3
"""
Script to generate demo_cache.json by running the real pipeline on a list of claims.
Usage: python build_demo_cache.py
"""
import sys
sys.stdout.reconfigure(encoding='utf-8')
import asyncio
import json
from pipeline import run_pipeline
from demo_cache import normalize_text, DEMO_CACHE_PATH

# List of claims to pre-verify for demo
DEMO_CLAIMS = [
    "सावधान! 500 रुपये के नोट पर हरी पट्टी अगर गांधी जी की तस्वीर के पास नहीं है बल्कि गवर्नर के हस्ताक्षर के पास है तो वह नोट पूरी तरह से नकली है। तुरंत सभी को फॉरवर्ड करें।",
    "UNESCO has officially declared the Indian National Anthem Jana Gana Mana as the best national anthem in the world.",
    "India won the ICC Men's T20 World Cup in June 2024 by defeating South Africa in Barbados."
]

async def build_cache():
    """Run pipeline on all demo claims and save results."""
    print("=" * 70)
    print("Building Demo Cache - Running verification on demo claims...")
    print("=" * 70)
    
    cache_data = {"claims": []}
    
    for idx, claim_text in enumerate(DEMO_CLAIMS, 1):
        print(f"\n[{idx}/{len(DEMO_CLAIMS)}] Processing: {claim_text[:80]}...")
        
        try:
            result = await run_pipeline(claim_text)
            normalized = normalize_text(claim_text)
            
            cache_entry = {
                "normalized_text": normalized,
                "result": result.model_dump()
            }
            
            cache_data["claims"].append(cache_entry)
            print(f"✓ Cached with verdict: {result.verdict} (confidence: {result.confidence}%)")
            
        except Exception as e:
            print(f"✗ Failed to process claim: {str(e)}")
            continue
    
    # Save to file
    with open(DEMO_CACHE_PATH, "w", encoding="utf-8") as f:
        json.dump(cache_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n" + "=" * 70)
    print(f"✓ Demo cache built successfully!")
    print(f"✓ Saved {len(cache_data['claims'])} claims to: {DEMO_CACHE_PATH}")
    print(f"✓ To enable demo mode, set DEMO_MODE=true in your .env file")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(build_cache())
