from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import sanitize_email, validate_password
from app.dependencies.auth import get_access_token, get_current_user
from app.schemas.auth import LoginRequest, LogoutResponse, SessionResponse, TokenResponse, UserResponse
from app.services.supabase_auth import SupabaseAuthService

router: APIRouter = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=SessionResponse)
async def login(payload: LoginRequest, svc: SupabaseAuthService = Depends(SupabaseAuthService)) -> SessionResponse:
    """Authenticate user with email/password against Supabase."""
    email: str = sanitize_email(str(payload.email))
    password: str = validate_password(payload.password)

    data: dict[str, Any] = await svc.login_with_password(email=email, password=password)

    access_token: str | None = data.get("access_token")
    refresh_token: str | None = data.get("refresh_token")
    token_type: str | None = data.get("token_type")
    expires_in: int | None = data.get("expires_in")
    user: dict[str, Any] | None = data.get("user")

    if not access_token or not refresh_token or not token_type or expires_in is None or not user:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Invalid auth response from Supabase.")

    user_id: str | None = user.get("id")
    user_email: str | None = user.get("email")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Invalid user payload from Supabase.")

    return SessionResponse(
        user=UserResponse(id=user_id, email=user_email),
        tokens=TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type=token_type,
            expires_in=int(expires_in),
        ),
    )


@router.post("/logout", response_model=LogoutResponse)
async def logout(
    token: str = Depends(get_access_token),
    svc: SupabaseAuthService = Depends(SupabaseAuthService),
) -> LogoutResponse:
    """Logout current session in Supabase."""
    await svc.logout(access_token=token)
    return LogoutResponse(success=True)


@router.get("/session", response_model=UserResponse)
async def session(current_user: dict[str, Any] = Depends(get_current_user)) -> UserResponse:
    """Return the current user session derived from the access token."""
    user_id: str | None = current_user.get("id")
    email: str | None = current_user.get("email")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Invalid user payload from Supabase.")
    return UserResponse(id=user_id, email=email)