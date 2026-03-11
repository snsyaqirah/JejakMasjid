"""
Authentication schemas for signup, login, and OTP verification.
"""
from pydantic import EmailStr, Field
from app.schemas.base import CamelModel


# ── Sign Up ──────────────────────────────────────────────────────────
class SignUpRequest(CamelModel):
    """User registration with email verification."""
    email: EmailStr
    password: str = Field(min_length=8, description="Min 8 characters")
    full_name: str = Field(min_length=2, max_length=100)
    phone_number: str | None = None


class SignUpResponse(CamelModel):
    """Response after signup - user must verify email."""
    message: str = "Verification code sent to your email"
    email: str
    user_id: str


# ── OTP Verification ────────────────────────────────────────────────
class VerifyOTPRequest(CamelModel):
    """6-digit OTP code verification."""
    email: EmailStr
    token: str = Field(min_length=6, max_length=6, description="6-digit code")


class VerifyOTPResponse(CamelModel):
    """Response after successful verification."""
    message: str = "Email verified successfully"
    access_token: str
    refresh_token: str
    user: dict


# ── Login ───────────────────────────────────────────────────────────
class LoginRequest(CamelModel):
    """Email and password login."""
    email: EmailStr
    password: str


class LoginResponse(CamelModel):
    """JWT tokens returned after successful login."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict


# ── Refresh Token ───────────────────────────────────────────────────
class RefreshTokenRequest(CamelModel):
    """Request new access token using refresh token."""
    refresh_token: str


# ── Resend OTP ──────────────────────────────────────────────────────
class ResendOTPRequest(CamelModel):
    """Resend verification code to email."""
    email: EmailStr
