import sys
sys.stdout.reconfigure(encoding='utf-8')
import asyncio
import httpx
from main import app
from rate_limiter import rate_limiter, MAX_REQUESTS_PER_MINUTE, InMemoryRateLimiter

def test_rate_limiter_unit():
    print("=" * 60)
    print("Testing Rate Limiter Unit Logic & Config...")
    print("=" * 60)

    print(f"✓ MAX_REQUESTS_PER_MINUTE constant configured to: {MAX_REQUESTS_PER_MINUTE}")

    limiter = InMemoryRateLimiter(max_requests=3, window_seconds=60)
    test_ip = "192.168.1.100"

    # Make 3 requests (should pass)
    for i in range(1, 4):
        allowed = limiter.is_allowed(test_ip)
        assert allowed is True, f"Request {i} should be allowed"
        print(f"  Request {i}: Allowed ({allowed})")

    # 4th request (should be rejected)
    allowed_4th = limiter.is_allowed(test_ip)
    assert allowed_4th is False, "Request 4 should be rejected"
    print(f"  Request 4: Allowed ({allowed_4th}) -> Properly rate limited!")

async def test_fastapi_rate_limiter():
    print("\n" + "=" * 60)
    print("Testing FastAPI /verify Rate Limit Endpoint (HTTP 429)...")
    print("=" * 60)

    rate_limiter.reset()

    ip_headers = {"X-Forwarded-For": "203.0.113.195"}
    claim_payload = {"text": "India won the ICC Men's T20 World Cup in June 2024"}

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        print(f"Making {MAX_REQUESTS_PER_MINUTE} valid requests...")
        for i in range(1, MAX_REQUESTS_PER_MINUTE + 1):
            res = await client.post("/verify", json=claim_payload, headers=ip_headers)
            assert res.status_code == 200, f"Request {i} failed with status {res.status_code}"
            print(f"  Request {i}/{MAX_REQUESTS_PER_MINUTE}: Status {res.status_code}")

        # Exceed limit with 11th request
        print("\nMaking request #11 (should return HTTP 429)...")
        res_exceeded = await client.post("/verify", json=claim_payload, headers=ip_headers)

        print(f"  Status code: {res_exceeded.status_code}")
        print(f"  JSON response: {res_exceeded.json()}")

        assert res_exceeded.status_code == 429, f"Expected 429, got {res_exceeded.status_code}"
        body = res_exceeded.json()
        assert body.get("error") is True, f"Expected error: True, got {body.get('error')}"
        assert body.get("message") == "Too many requests. Please wait a moment and try again.", f"Unexpected message: {body.get('message')}"

        print("\n✓ Rate Limiter HTTP 429 Test Passed Successfully!")

if __name__ == "__main__":
    test_rate_limiter_unit()
    asyncio.run(test_fastapi_rate_limiter())
