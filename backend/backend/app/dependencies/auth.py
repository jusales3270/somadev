from __future__ import annotations

from typing import Any

from fastapi import Depends, Header

from app.core.config import settings
from app.core.security import extract_bearer_token
from app.services.supabase_auth import SupabaseAuthService


async def get_access_token(authorization: str | None = Header(default=None, alias="Authorization")) -> str:
    """Extract access token from Authorization header."""
    return extract_bearer_token(authorization, bearer_prefix=settings.bearer_prefix)


async def get_current_user(
    token: str = Depends(get_access_token),
    svc: SupabaseAuthService = Depends(SupabaseAuthService),
) -> dict[str, Any]:
    """Resolve the current user from Supabase using the bearer token."""
    return await svc.get_user(token)