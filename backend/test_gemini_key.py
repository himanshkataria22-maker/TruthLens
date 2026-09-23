import os
import sys
from dotenv import load_dotenv
import asyncio
import httpx

sys.stdout.reconfigure(encoding='utf-8')

load_dotenv()

gemini_key = os.getenv('LLM_API_KEY', '').strip()
print(f'[TEST] LLM_API_KEY loaded: {bool(gemini_key)}')
print(f'[TEST] Key length: {len(gemini_key)}')
print(f'[TEST] Key preview: {gemini_key[:30]}...')

if not gemini_key:
    print('[ERROR] LLM_API_KEY is empty!')
    sys.exit(1)

# Test the API key with a simple health check
async def test_gemini_api():
    headers = {
        "Content-Type": "application/json",
    }
    
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": "Hello"}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.1,
            "maxOutputTokens": 10
        }
    }
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={gemini_key}"
    
    print('\n[TEST] Making request to Google Gemini API...')
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            res = await client.post(url, headers=headers, json=payload)
            print(f'[TEST] Response status: {res.status_code}')
            if res.status_code == 200:
                print('[SUCCESS] Gemini API key is VALID! ✅')
            elif res.status_code == 401:
                print('[ERROR] Gemini API key is INVALID (401 Unauthorized)')
            elif res.status_code == 400:
                print('[ERROR] Bad request (400) - key might be invalid')
            else:
                print(f'[ERROR] Unexpected status: {res.status_code}')
            print(f'[TEST] Response: {res.text[:300]}')
    except Exception as e:
        print(f'[ERROR] Exception: {str(e)}')

asyncio.run(test_gemini_api())
