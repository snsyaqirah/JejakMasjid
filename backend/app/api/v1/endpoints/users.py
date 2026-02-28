import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.common import MessageResponse
from app.schemas.user import UserProfile, UserPublic, UserUpdate

router = APIRouter()


@router.get("/me", response_model=UserPublic)
async def get_my_profile(db: AsyncSession = Depends(get_db)):
    """Profil saya — includes private fields like email."""
    raise NotImplementedError


@router.patch("/me", response_model=UserPublic)
async def update_my_profile(body: UserUpdate, db: AsyncSession = Depends(get_db)):
    """Kemaskini profil saya."""
    raise NotImplementedError


@router.get("/{user_id}", response_model=UserProfile)
async def get_user_profile(user_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Public profile page — no sensitive data exposed."""
    raise NotImplementedError


@router.delete("/me", response_model=MessageResponse)
async def delete_my_account(db: AsyncSession = Depends(get_db)):
    """Soft-delete my account. Sets deleted_at on User."""
    raise NotImplementedError
