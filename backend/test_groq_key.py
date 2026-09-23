import os
import sys
from dotenv import load_dotenv
import asyncio
import httpx

# Ensure UTF-8 encoding
sys.stdout.reconfigure(encoding='utf-8')

load_dotenv()

groq_key = os.getenv('GROQ_API_KEY', '').strip()
print(f'[TEST] GROQ_API_KEY loaded: {bool(groq_key)}')
print(f'[TEST] Key starts with gsk_: {groq_key.startswith("gsk_")}')
print(f'[TEST] Key length: {len(groq_key)}')
print(f'[TEST] Key preview: {groq_key[:30]}...')

if not groq_key:
    print('[ERROR] GROQ_API_KEY is empty!')
    sys.exit(1)

# Test the API key with a simple health check
async def test_groq_api():
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {groq_key}"
    }
    
    payload = {
        "model": "llama-3.2-90b-vision-preview",
        "messages": [
            {"role": "user", "content": "Hello"}
        ],
        "temperature": 0.1,
        "max_tokens": 10
    }
    
    print('\n[TEST] Making request to Groq API...')
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            res = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                json=payload
            )
            print(f'[TEST] Response status: {res.status_code}')
            if res.status_code == 200:
                print('[SUCCESS] Groq API key is VALID! ✅')
            elif res.status_code == 401:
                print('[ERROR] Groq API key is INVALID (401 Unauthorized)')
            else:
                print(f'[ERROR] Unexpected status: {res.status_code}')
            print(f'[TEST] Response: {res.text[:200]}')
    except Exception as e:
        print(f'[ERROR] Exception: {str(e)}')

asyncio.run(test_groq_api())
