import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, UUIDMixin

if TYPE_CHECKING:
    from app.models.masjid import Masjid
    from app.models.user import User


class Visit(Base, UUIDMixin):
    """A single check-in / 'Langkah' by a user at a masjid."""

    __tablename__ = "visits"

    # ── FK ─────────────────────────────────────────────────────────────────────
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    masjid_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("masjids.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # ── Visit details ──────────────────────────────────────────────────────────
    # prayer_type options:
    #   "subuh" | "zohor" | "asar" | "maghrib" | "isyak"
    #   "jumaat" | "terawih" | "iftar" | "tahajjud" | "others"
    prayer_type: Mapped[str] = mapped_column(String(20), nullable=False, index=True)

    visited_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_ramadan: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # ── Relationships ──────────────────────────────────────────────────────────
    user: Mapped["User"] = relationship(back_populates="visits")
    masjid: Mapped["Masjid"] = relationship(back_populates="visits")

    def __repr__(self) -> str:
        return f"<Visit user={self.user_id} masjid={self.masjid_id} [{self.prayer_type}]>"
