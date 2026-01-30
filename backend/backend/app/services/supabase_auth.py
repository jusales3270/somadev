from __future__ import annotations

from typing import Any

import httpx
from fastapi import HTTPException, status

from app.core.config import settings


class SupabaseAuthService:
    """Service for interacting with Supabase Auth REST endpoints.

    Uses Supabase Auth endpoints directly via HTTP for robustness and to avoid
    client-side session state on the backend.
    """

    def __init__(self) -> None:
        self._base_url: str = settings.supabase_url.rstrip("/")
        self._anon_key: str = settings.supabase_anon_key

    def _headers(self) -> dict[str, str]:
        return {
            "apikey": self._anon_key,
            "Authorization": f"Bearer {self._anon_key}",
            "Content-Type": "application/json",
        }

    async def login_with_password(self, email: str, password: str) -> dict[str, Any]:
        """Login using email/password.

        Args:
            email: User email.
            password: User password.

        Returns:
            Supabase auth response with session data.

        Raises:
            HTTPException: On auth failure or upstream error.
        """
        url: str = f"{self._base_url}/auth/v1/token?grant_type=password"
        payload: dict[str, str] = {"email": email, "password": password}

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp: httpx.Response = await client.post(url, headers=self._headers(), json=payload)
        except httpx.TimeoutException:
            raise HTTPException(status_code=status.HTTP_504_GATEWAY_TIMEOUT, detail="Supabase timeout.")
        except httpx.RequestError:
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Supabase unreachable.")

        if resp.status_code >= 400:
            # Do not leak upstream details excessively
            if resp.status_code in (400, 401):
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials.")
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Supabase auth error.")

        data: dict[str, Any] = resp.json()
        return data

    async def get_user(self, access_token: str) -> dict[str, Any]:
        """Get current user from access token.

        Args:
            access_token: JWT access token.

        Returns:
            Supabase user payload.

        Raises:
            HTTPException: If token invalid or upstream error.
        """
        url: str = f"{self._base_url}/auth/v1/user"
        headers: dict[str, str] = {
            "apikey": self._anon_key,
            "Authorization": f"Bearer {access_token}",
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp: httpx.Response = await client.get(url, headers=headers)
        except httpx.TimeoutException:
            raise HTTPException(status_code=status.HTTP_504_GATEWAY_TIMEOUT, detail="Supabase timeout.")
        except httpx.RequestError:
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Supabase unreachable.")

        if resp.status_code >= 400:
            if resp.status_code in (401, 403):
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token.")
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Supabase user fetch error.")

        return resp.json()

    async def logout(self, access_token: str) -> None:
        """Logout (invalidate session) for the given access token.

        Note: Supabase signout invalidates refresh tokens for the current session.

        Args:
            access_token: JWT access token.

        Raises:
            HTTPException: On upstream error.
        """
        url: str = f"{self._base_url}/auth/v1/logout"
        headers: dict[str, str] = {
            "apikey": self._anon_key,
            "Authorization": f"Bearer {access_token}",
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp: httpx.Response = await client.post(url, headers=headers)
        except httpx.TimeoutException:
            raise HTTPException(status_code=status.HTTP_504_GATEWAY_TIMEOUT, detail="Supabase timeout.")
        except httpx.RequestError:
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Supabase unreachable.")

        if resp.status_code >= 400:
            if resp.status_code in (401, 403):
                # Treat as already logged out/invalid token
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token.")
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Supabase logout error.")