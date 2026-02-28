import uuid
from datetime import datetime

from pydantic import Field, field_validator

from app.schemas.base import CamelModel
from app.schemas.user import UserProfile


# ── Shared enums-as-literals ─────────────────────────────────────────────────
MasjidStatus = str   # "unverified" | "verified" | "rejected"


# ── Request bodies ───────────────────────────────────────────────────────────

class MasjidCreate(CamelModel):
    name: str = Field(min_length=3, max_length=200)
    description: str | None = Field(default=None, max_length=2000)
    address: str = Field(max_length=500)
    city: str = Field(max_length=100)
    state: str = Field(max_length=100)
    postcode: str | None = Field(default=None, max_length=10)
    country: str = Field(default="Malaysia", max_length=100)
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    google_place_id: str | None = None
    google_maps_url: str | None = None
    facilities: dict | None = None


class MasjidUpdate(CamelModel):
    name: str | None = Field(default=None, min_length=3, max_length=200)
    description: str | None = None
    address: str | None = Field(default=None, max_length=500)
    city: str | None = Field(default=None, max_length=100)
    state: str | None = Field(default=None, max_length=100)
    postcode: str | None = Field(default=None, max_length=10)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    facilities: dict | None = None
    cover_image_url: str | None = None


# ── Response bodies ───────────────────────────────────────────────────────────

class MasjidSummary(CamelModel):
    """Lightweight card — used in list/map views."""
    id: uuid.UUID
    name: str
    slug: str
    city: str
    state: str
    latitude: float
    longitude: float
    status: MasjidStatus
    verification_count: int
    visit_count: int
    average_rating: float | None
    cover_image_url: str | None


class MasjidDetail(CamelModel):
    """Full masjid page data."""
    id: uuid.UUID
    name: str
    slug: str
    description: str | None
    address: str
    city: str
    state: str
    postcode: str | None
    country: str
    latitude: float
    longitude: float
    google_place_id: str | None
    google_maps_url: str | None
    images: list | None
    cover_image_url: str | None
    facilities: dict | None
    status: MasjidStatus
    verification_count: int
    visit_count: int
    average_rating: float | None
    review_count: int
    submitted_by: UserProfile | None
    created_at: datetime
    updated_at: datetime


class NearbyQuery(CamelModel):
    """Query params for duplicate-check and nearby masjid search."""
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    radius_meters: int = Field(default=100, ge=50, le=50_000)
