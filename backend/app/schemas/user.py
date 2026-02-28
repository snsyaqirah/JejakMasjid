import uuid
from datetime import datetime

from pydantic import EmailStr, Field

from app.schemas.base import CamelModel


# ── Request bodies ──────────────────────────────────────────────────────────

class UserRegister(CamelModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str = Field(min_length=2, max_length=100)


class UserLogin(CamelModel):
    email: EmailStr
    password: str


class UserUpdate(CamelModel):
    full_name: str | None = Field(default=None, max_length=100)
    display_name: str | None = Field(default=None, max_length=50)
    bio: str | None = Field(default=None, max_length=280)
    avatar_url: str | None = None


# ── Response bodies ──────────────────────────────────────────────────────────

class UserPublic(CamelModel):
    """Safe public profile — never expose password_hash or google_id."""
    id: uuid.UUID
    email: EmailStr
    full_name: str
    display_name: str | None
    avatar_url: str | None
    bio: str | None
    role: str
    is_email_verified: bool
    created_at: datetime


class UserProfile(CamelModel):
    """Public-facing profile (no email)."""
    id: uuid.UUID
    display_name: str | None
    full_name: str
    avatar_url: str | None
    bio: str | None
    created_at: datetime


# ── Auth responses ───────────────────────────────────────────────────────────

class TokenPair(CamelModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenRefresh(CamelModel):
    refresh_token: str
