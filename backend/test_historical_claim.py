#!/usr/bin/env python
"""Test historical claim verification"""
import asyncio
import httpx
import json

async def test_historical_claim():
    """Test the Panipat historical claim"""
    url = "http://localhost:8000/verify"
    
    claim = "The Second Battle of Panipat was fought in 1556 between Akbar and Hemu"
    
    payload = {
        "text": claim,
        "target_language": "en"
    }
    
    print(f"\n{'='*70}")
    print(f"Testing Historical Claim:")
    print(f"Claim: {claim}")
    print(f"{'='*70}\n")
    
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(url, json=payload)
            
            if response.status_code == 200:
                data = response.json()
                print(f"✓ Verification completed successfully!")
                print(f"\nVERDICT: {data['verdict']}")
                print(f"CONFIDENCE: {data['confidence']}%")
                print(f"\nEXPLANATION:\n{data['explanation']}\n")
                
                if data['evidence']:
                    print(f"EVIDENCE SOURCES ({len(data['evidence'])} found):")
                    for i, src in enumerate(data['evidence'], 1):
                        print(f"\n{i}. {src['title']}")
                        print(f"   Domain: {src['domain']} (Tier {src['tier']})")
                        print(f"   Stance: {src['stance']}")
                        print(f"   Reason: {src['reason']}")
                        print(f"   URL: {src['url']}")
                else:
                    print("❌ NO EVIDENCE SOURCES FOUND (This is the bug!)")
                
                print(f"\nEXECUTION TIME:")
                for step in data['steps']:
                    print(f"  - {step['name']}: {step['duration_ms']}ms")
            else:
                print(f"❌ Request failed with status {response.status_code}")
                print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_historical_claim())
