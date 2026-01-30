from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_config
from app.db.base import Base
from app.db.session import engine
from app.todos.router import router as todos_router

config = get_config()

app = FastAPI(title=config.app_name)

# CORS (tighten in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if config.env == "dev" else [],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    """Create database tables on startup (simple bootstrap)."""
    Base.metadata.create_all(bind=engine)


app.include_router(todos_router)