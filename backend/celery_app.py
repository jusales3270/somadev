import os
from celery import Celery
from dotenv import load_dotenv

load_dotenv()

# Use Redis as both broker and backend
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "somadev_worker",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=["tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    worker_concurrency=int(os.getenv("CELERY_CONCURRENCY", 4)),
)

if __name__ == "__main__":
    celery_app.start()
