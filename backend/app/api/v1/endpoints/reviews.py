import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.activity import ReviewResponse, ReviewUpdate
from app.schemas.common import MessageResponse

router = APIRouter()


@router.patch("/{review_id}", response_model=ReviewResponse)
async def update_review(
    review_id: uuid.UUID,
    body: ReviewUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Kemaskini ulasan saya (own review only)."""
    raise NotImplementedError


@router.delete("/{review_id}", response_model=MessageResponse)
async def delete_review(review_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Soft-delete ulasan saya (own review only)."""
    raise NotImplementedError
