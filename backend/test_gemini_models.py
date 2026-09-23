import os
import sys
from dotenv import load_dotenv
import asyncio
import httpx
import json

sys.stdout.reconfigure(encoding='utf-8')

load_dotenv()

gemini_key = os.getenv('LLM_API_KEY', '').strip()
print(f'[TEST] LLM_API_KEY: {gemini_key[:30]}...')

# Test listing available models
async def list_models():
    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={gemini_key}"
    
    print('\n[TEST] Fetching available models...')
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            res = await client.get(url)
            print(f'[TEST] Response status: {res.status_code}')
            if res.status_code == 200:
                data = res.json()
                print('[TEST] Available models:')
                for model in data.get('models', []):
                    print(f"  - {model.get('name')}")
                    if 'supportedGenerationMethods' in model:
                        print(f"    Methods: {model.get('supportedGenerationMethods')}")
            else:
                print(f'Response: {res.text[:500]}')
    except Exception as e:
        print(f'[ERROR] Exception: {str(e)}')

asyncio.run(list_models())
