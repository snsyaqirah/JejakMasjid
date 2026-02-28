import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, UUIDMixin

if TYPE_CHECKING:
    from app.models.masjid import Masjid
    from app.models.user import User


class Verification(Base, UUIDMixin):
    """
    Community verification / flagging of a Masjid entry.

    Business rules:
    - One vote per (user, masjid) pair — enforced by the unique constraint.
    - action="upvote"  → counted towards verification_count on Masjid.
    - action="flag"    → routes the masjid to a moderator review queue.
    - When masjid.verification_count >= Masjid.VERIFY_THRESHOLD (3),
      a background task sets masjid.status = "verified".
    """

    __tablename__ = "verifications"
    __table_args__ = (UniqueConstraint("user_id", "masjid_id", name="uq_user_masjid_vote"),)

    # ── FK ─────────────────────────────────────────────────────────────────────
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    masjid_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("masjids.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # ── Action ─────────────────────────────────────────────────────────────────
    # action options: "upvote" | "flag"
    action: Mapped[str] = mapped_column(String(10), nullable=False, default="upvote")

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # ── Relationships ──────────────────────────────────────────────────────────
    user: Mapped["User"] = relationship(back_populates="verifications")
    masjid: Mapped["Masjid"] = relationship(back_populates="verifications")

    def __repr__(self) -> str:
        return f"<Verification {self.action} user={self.user_id} masjid={self.masjid_id}>"
