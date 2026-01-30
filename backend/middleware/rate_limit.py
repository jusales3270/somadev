"""
Rate Limiting Middleware for FastAPI
Implements token bucket algorithm with Redis for distributed state
"""
import time
import asyncio
from typing import Tuple
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from database.redis_client import get_redis_client
import redis

class RedisRateLimiter:
    """Token bucket rate limiter using Redis"""
    
    def __init__(self, requests_per_minute: int = 60, burst_size: int = 10):
        self.requests_per_minute = requests_per_minute
        self.burst_size = burst_size
        self.redis = get_redis_client()
        
    async def is_allowed(self, key: str) -> Tuple[bool, int]:
        """
        Check if request is allowed using Redis.
        Returns (allowed, retry_after_seconds)
        """
        try:
            tokens_key = f"rate_limit:{key}:tokens"
            last_update_key = f"rate_limit:{key}:last_update"
            
            # Lua script for token bucket
            lua_script = """
            local tokens_key = KEYS[1]
            local last_update_key = KEYS[2]
            local rate = tonumber(ARGV[1])
            local burst = tonumber(ARGV[2])
            local now = tonumber(ARGV[3])
            
            local tokens = tonumber(redis.call('get', tokens_key))
            local last_update = tonumber(redis.call('get', last_update_key))
            
            if tokens == nil then
                tokens = burst
                last_update = now
            end
            
            local time_passed = now - last_update
            local tokens_to_add = time_passed * (rate / 60.0)
            tokens = math.min(burst, tokens + tokens_to_add)
            
            local allowed = 0
            local retry_after = 0
            
            if tokens >= 1 then
                tokens = tokens - 1
                allowed = 1
                redis.call('set', tokens_key, tokens)
                redis.call('set', last_update_key, now)
            else
                local tokens_needed = 1 - tokens
                retry_after = math.ceil(tokens_needed / (rate / 60.0))
            end
            
            -- Set expiry to avoid stale keys (e.g. 1 hour)
            redis.call('expire', tokens_key, 3600)
            redis.call('expire', last_update_key, 3600)
            
            return {allowed, retry_after}
            """
            
            # Execute script
            result = self.redis.eval(
                lua_script, 
                2, 
                tokens_key, 
                last_update_key, 
                self.requests_per_minute, 
                self.burst_size, 
                time.time()
            )
            
            allowed = bool(result[0])
            retry_after = int(result[1])
            
            return allowed, retry_after
            
        except redis.RedisError as e:
            # Fail open if Redis is down, but log it
            print(f"⚠️ Redis Rate Limiter Error: {e}")
            return True, 0

class RateLimitMiddleware(BaseHTTPMiddleware):
    """FastAPI middleware for rate limiting backed by Redis"""
    
    def __init__(self, app, requests_per_minute: int = 60, burst_size: int = 10):
        super().__init__(app)
        self.limiter = RedisRateLimiter(requests_per_minute, burst_size)
        # Endpoints to rate limit
        self.rate_limited_paths = ["/chat", "/execute", "/api/preview", "/api/deploy"]
    
    async def dispatch(self, request: Request, call_next):
        # Get client identifier (IP or API key)
        client_ip = request.client.host if request.client else "unknown"
        api_key = request.headers.get("x-api-key", "")
        client_id = api_key if api_key else client_ip
        
        # Check if this path should be rate limited
        should_limit = any(request.url.path.startswith(path) for path in self.rate_limited_paths)
        
        if should_limit:
            allowed, retry_after = await self.limiter.is_allowed(client_id)
            
            if not allowed:
                raise HTTPException(
                    status_code=429,
                    detail={
                        "error": "Rate limit exceeded",
                        "retry_after": retry_after,
                        "message": f"Too many requests. Please wait {retry_after} seconds."
                    },
                    headers={"Retry-After": str(retry_after)}
                )
        
        response = await call_next(request)
        return response
