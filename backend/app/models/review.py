import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, UUIDMixin

if TYPE_CHECKING:
    from app.models.masjid import Masjid
    from app.models.user import User


class Review(Base, UUIDMixin):
    __tablename__ = "reviews"

    # ── FK ─────────────────────────────────────────────────────────────────────
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    masjid_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("masjids.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # ── Review content ─────────────────────────────────────────────────────────
    rating: Mapped[int] = mapped_column(Integer, nullable=False)  # 1–5
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)

    # ── Sub-ratings (optional, enhances trust) ────────────────────────────────
    cleanliness_rating: Mapped[int | None] = mapped_column(Integer, nullable=True)   # 1–5
    facilities_rating: Mapped[int | None] = mapped_column(Integer, nullable=True)    # 1–5
    crowd_rating: Mapped[int | None] = mapped_column(Integer, nullable=True)         # 1–5 (1=packed, 5=spacious)

    # ── Moderation ─────────────────────────────────────────────────────────────
    is_approved: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # ── Timestamps ─────────────────────────────────────────────────────────────
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
    deleted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True, default=None
    )

    # ── Relationships ──────────────────────────────────────────────────────────
    user: Mapped["User"] = relationship(back_populates="reviews")
    masjid: Mapped["Masjid"] = relationship(back_populates="reviews")

    def __repr__(self) -> str:
        return f"<Review ★{self.rating} user={self.user_id} masjid={self.masjid_id}>"
