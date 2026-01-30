from __future__ import annotations

from pydantic import BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    APP_NAME: str = "SomaDev API"
    ENV: str = "dev"

    # Database
    DATABASE_URL: str = "sqlite+pysqlite:///./app.db"

    # SQLite safety
    SQLITE_CHECK_SAME_THREAD: bool = False


class AppConfig(BaseModel):
    """Derived configuration used by the application."""

    app_name: str
    env: str
    database_url: str
    sqlite_check_same_thread: bool


def get_config() -> AppConfig:
    """Build and return the application configuration."""
    s: Settings = Settings()
    return AppConfig(
        app_name=s.APP_NAME,
        env=s.ENV,
        database_url=s.DATABASE_URL,
        sqlite_check_same_thread=s.SQLITE_CHECK_SAME_THREAD,
    )