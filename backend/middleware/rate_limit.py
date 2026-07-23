import time
from fastapi import Request, HTTPException

class RateLimiter:
    def __init__(self, limit: int = 60, window: int = 60):
        self.limit = limit
        self.window = window
        self.requests = {}

    def is_allowed(self, client_ip: str) -> bool:
        now = time.time()
        if client_ip not in self.requests:
            self.requests[client_ip] = []
        self.requests[client_ip] = [t for t in self.requests[client_ip] if now - t < self.window]
        if len(self.requests[client_ip]) >= self.limit:
            return False
        self.requests[client_ip].append(now)
        return True

limiter = RateLimiter(limit=60, window=60)

def rate_limit_middleware(request: Request):
    client_ip = request.client.host if request.client else "127.0.0.1"
    if not limiter.is_allowed(client_ip):
        raise HTTPException(status_code=429, detail="Too Many Requests")
