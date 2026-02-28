import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.masjid import Masjid
    from app.models.review import Review
    from app.models.verification import Verification
    from app.models.visit import Visit


class User(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "users"

    # ── Authentication ─────────────────────────────────────────────────────────
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)  # NULL for OAuth-only users
    google_id: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)

    # ── Profile ────────────────────────────────────────────────────────────────
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    display_name: Mapped[str | None] = mapped_column(String(50), nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    bio: Mapped[str | None] = mapped_column(String(280), nullable=True)  # Twitter-length tagline

    # ── Status flags ───────────────────────────────────────────────────────────
    is_email_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    role: Mapped[str] = mapped_column(String(20), default="user", nullable=False)
    # role options: "user" | "moderator" | "admin"

    # ── Relationships ──────────────────────────────────────────────────────────
    submitted_masjids: Mapped[list["Masjid"]] = relationship(back_populates="submitted_by_user")
    visits: Mapped[list["Visit"]] = relationship(back_populates="user")
    verifications: Mapped[list["Verification"]] = relationship(back_populates="user")
    reviews: Mapped[list["Review"]] = relationship(back_populates="user")

    def __repr__(self) -> str:
        return f"<User {self.email}>"
