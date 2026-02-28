from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.common import MessageResponse
from app.schemas.user import TokenPair, TokenRefresh, UserLogin, UserPublic, UserRegister

router = APIRouter()


@router.post("/register", response_model=UserPublic, status_code=201)
async def register(body: UserRegister, db: AsyncSession = Depends(get_db)):
    """
    Daftar akaun baru.
    Creates a new user and sends a verification email.
    """
    # TODO: implement UserService.create_user(db, body)
    raise NotImplementedError


@router.post("/login", response_model=TokenPair)
async def login(body: UserLogin, db: AsyncSession = Depends(get_db)):
    """
    Log masuk dengan email & password.
    Returns access_token + refresh_token.
    """
    raise NotImplementedError


@router.post("/refresh", response_model=TokenPair)
async def refresh_token(body: TokenRefresh):
    """Exchange a valid refresh token for a new token pair."""
    raise NotImplementedError


@router.post("/logout", response_model=MessageResponse)
async def logout(body: TokenRefresh):
    """Revoke/blacklist the provided refresh token."""
    raise NotImplementedError


@router.get("/verify-email", response_model=MessageResponse)
async def verify_email(token: str, db: AsyncSession = Depends(get_db)):
    """Confirm the email address using the one-time token from the verification email."""
    raise NotImplementedError


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(email: str, db: AsyncSession = Depends(get_db)):
    """Send a password-reset link to the given email."""
    raise NotImplementedError


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(token: str, new_password: str, db: AsyncSession = Depends(get_db)):
    """Apply the new password using the reset token."""
    raise NotImplementedError


# ── Google OAuth ──────────────────────────────────────────────────────────────

@router.get("/google")
async def google_oauth_redirect():
    """Redirect user to Google's OAuth consent screen."""
    raise NotImplementedError


@router.get("/google/callback", response_model=TokenPair)
async def google_oauth_callback(code: str, db: AsyncSession = Depends(get_db)):
    """
    Handle Google OAuth callback.
    Creates account if first-time, issues token pair.
    """
    raise NotImplementedError
