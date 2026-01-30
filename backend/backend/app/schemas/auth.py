from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    """Request body for email/password login."""

    email: EmailStr = Field(..., description="User email")
    password: str = Field(..., min_length=8, max_length=1024, description="User password")


class TokenResponse(BaseModel):
    """Response containing Supabase session tokens."""

    access_token: str = Field(..., description="JWT access token")
    refresh_token: str = Field(..., description="Refresh token")
    token_type: str = Field(default="bearer", description="Token type")
    expires_in: int = Field(..., description="Seconds until expiration")


class UserResponse(BaseModel):
    """Minimal user info returned by Supabase."""

    id: str
    email: str | None = None


class SessionResponse(BaseModel):
    """Response containing session and user info."""

    user: UserResponse
    tokens: TokenResponse


class LogoutResponse(BaseModel):
    """Logout response."""

    success: bool = True