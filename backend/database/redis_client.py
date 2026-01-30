import os
import redis
from dotenv import load_dotenv

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

class RedisClient:
    _instance = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            # Create connection pool
            pool = redis.ConnectionPool.from_url(REDIS_URL, decode_responses=True)
            cls._instance = redis.Redis(connection_pool=pool)
        return cls._instance

# Helper to get the client
def get_redis_client():
    return RedisClient.get_instance()
