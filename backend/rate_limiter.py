import time
from collections import defaultdict
from threading import Lock
from fastapi import Request
from fastapi.responses import JSONResponse

# Rate limiter configuration constant: maximum requests allowed per minute per IP address
MAX_REQUESTS_PER_MINUTE = 10
WINDOW_SECONDS = 60


class InMemoryRateLimiter:
    """
    In-memory rate limiter using a sliding window log per IP address.
    No external dependencies required.
    """
    def __init__(self, max_requests: int = MAX_REQUESTS_PER_MINUTE, window_seconds: int = WINDOW_SECONDS):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: dict[str, list[float]] = defaultdict(list)
        self.lock = Lock()

    def is_allowed(self, ip: str) -> bool:
        """
        Returns True if request from client IP is within allowed window, False otherwise.
        """
        now = time.time()
        cutoff = now - self.window_seconds

        with self.lock:
            # Clean up timestamps older than window cutoff
            timestamps = [t for t in self.requests[ip] if t > cutoff]

            if len(timestamps) >= self.max_requests:
                self.requests[ip] = timestamps
                return False

            timestamps.append(now)
            self.requests[ip] = timestamps
            return True

    def reset(self):
        """Reset rate limiter state (useful for tests)."""
        with self.lock:
            self.requests.clear()


# Global rate limiter instance
rate_limiter = InMemoryRateLimiter()


def get_client_ip(request: Request) -> str:
    """Extract client IP address from headers or connection."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip.strip()
    if request.client and request.client.host:
        return request.client.host
    return "127.0.0.1"
