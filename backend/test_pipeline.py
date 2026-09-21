import sys
sys.stdout.reconfigure(encoding='utf-8')
import asyncio
import json
from pipeline import run_pipeline

TEST_CLAIMS = [
    {
        "name": "1. Hindi Viral WhatsApp Forward",
        "text": "सावधान! 500 रुपये के नोट पर हरी पट्टी अगर गांधी जी की तस्वीर के पास नहीं है बल्कि गवर्नर के हस्ताक्षर के पास है तो वह नोट पूरी तरह से नकली है। तुरंत सभी को फॉरवर्ड करें।"
    },
    {
        "name": "2. English Factual Claim",
        "text": "India won the ICC Men's T20 World Cup in June 2024 by defeating South Africa in Barbados."
    },
    {
        "name": "3. Viral Debunked Claim",
        "text": "UNESCO has officially declared the Indian National Anthem Jana Gana Mana as the best national anthem in the world."
    }
]

async def main():
    print("=" * 70)
    print("TruthLens Backend Pipeline Multi-Agent Test Suite")
    print("=" * 70)
    
    for idx, test_case in enumerate(TEST_CLAIMS, 1):
        print(f"\n--- Test Case {idx}: {test_case['name']} ---")
        print(f"Input Text: {test_case['text']}")
        print("Running pipeline...")
        
        result = await run_pipeline(test_case["text"])
        
        print("\nPipeline Result (JSON):")
        print(json.dumps(result.model_dump(), indent=2, ensure_ascii=False))
        print("-" * 70)

if __name__ == "__main__":
    asyncio.run(main())
