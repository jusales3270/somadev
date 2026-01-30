from __future__ import annotations

import re
from typing import Final

from fastapi import HTTPException, status

_EMAIL_RE: Final[re.Pattern[str]] = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def sanitize_email(email: str) -> str:
    """Normalize and validate an email string.

    Args:
        email: Raw email.

    Returns:
        Sanitized email.

    Raises:
        HTTPException: If invalid.
    """
    value: str = (email or "").strip().lower()
    if not value or len(value) > 254 or not _EMAIL_RE.match(value):
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid email.")
    return value


def validate_password(password: str) -> str:
    """Validate password basic constraints.

    Args:
        password: Raw password.

    Returns:
        Password unchanged if valid.

    Raises:
        HTTPException: If invalid.
    """
    if password is None:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Password is required.")
    if len(password) < 8:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Password must be at least 8 characters.",
        )
    if len(password) > 1024:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Password too long.")
    return password


def extract_bearer_token(authorization: str | None, bearer_prefix: str = "Bearer") -> str:
    """Extract bearer token from Authorization header.

    Args:
        authorization: Header value.
        bearer_prefix: Prefix used.

    Returns:
        Token string.

    Raises:
        HTTPException: If missing/invalid.
    """
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing Authorization header.")
    parts: list[str] = authorization.split()
    if len(parts) != 2 or parts[0] != bearer_prefix:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Authorization header format.")
    token: str = parts[1].strip()
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Empty token.")
    return token