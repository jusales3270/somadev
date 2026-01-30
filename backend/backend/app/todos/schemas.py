from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class TodoBase(BaseModel):
    """Base fields shared by Todo schemas."""

    title: str = Field(..., min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=10_000)
    is_done: bool = False

    @field_validator("title")
    @classmethod
    def sanitize_title(cls, v: str) -> str:
        """Normalize and sanitize title input."""
        cleaned: str = v.strip()
        if not cleaned:
            raise ValueError("title cannot be blank")
        return cleaned


class TodoCreate(TodoBase):
    """Payload to create a Todo."""

    pass


class TodoUpdate(BaseModel):
    """Payload to update a Todo (partial update)."""

    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=10_000)
    is_done: bool | None = None

    @field_validator("title")
    @classmethod
    def sanitize_title(cls, v: str | None) -> str | None:
        """Normalize and sanitize title input if provided."""
        if v is None:
            return None
        cleaned: str = v.strip()
        if not cleaned:
            raise ValueError("title cannot be blank")
        return cleaned


class TodoOut(BaseModel):
    """Response schema for Todo."""

    id: int
    title: str
    description: str | None
    is_done: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True