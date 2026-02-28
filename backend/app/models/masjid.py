import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.review import Review
    from app.models.user import User
    from app.models.verification import Verification
    from app.models.visit import Visit


class Masjid(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "masjids"

    # ── Identity ───────────────────────────────────────────────────────────────
    name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    slug: Mapped[str] = mapped_column(String(250), unique=True, index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # ── Location ───────────────────────────────────────────────────────────────
    address: Mapped[str] = mapped_column(Text, nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    state: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    postcode: Mapped[str | None] = mapped_column(String(10), nullable=True)
    country: Mapped[str] = mapped_column(String(100), default="Malaysia", nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)

    # ── Third-party references ─────────────────────────────────────────────────
    google_place_id: Mapped[str | None] = mapped_column(String(200), nullable=True)
    google_maps_url: Mapped[str | None] = mapped_column(Text, nullable=True)

    # ── Media ──────────────────────────────────────────────────────────────────
    # Stored as: [{"url": "...", "caption": "...", "is_primary": true}]
    images: Mapped[list | None] = mapped_column(JSONB, default=list, nullable=True)
    cover_image_url: Mapped[str | None] = mapped_column(Text, nullable=True)

    # ── Facilities ─────────────────────────────────────────────────────────────
    # Stored as: {"wifi": true, "parking": true, "ablution": true, "wheelchair": false, ...}
    facilities: Mapped[dict | None] = mapped_column(JSONB, default=dict, nullable=True)

    # ── Verification & status ──────────────────────────────────────────────────
    # status options: "unverified" | "verified" | "rejected"
    status: Mapped[str] = mapped_column(String(20), default="unverified", nullable=False, index=True)
    verification_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    # Auto-verify threshold (configurable in settings, default=3)
    VERIFY_THRESHOLD: int = 3

    # ── Aggregate stats (denormalised for performance) ─────────────────────────
    visit_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    average_rating: Mapped[float | None] = mapped_column(Float, nullable=True)
    review_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # ── Submission ─────────────────────────────────────────────────────────────
    submitted_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # ── Relationships ──────────────────────────────────────────────────────────
    submitted_by_user: Mapped["User | None"] = relationship(back_populates="submitted_masjids")
    visits: Mapped[list["Visit"]] = relationship(back_populates="masjid")
    verifications: Mapped[list["Verification"]] = relationship(back_populates="masjid")
    reviews: Mapped[list["Review"]] = relationship(back_populates="masjid")

    def __repr__(self) -> str:
        return f"<Masjid {self.name} [{self.status}]>"
