import uuid
from datetime import datetime
from typing import Literal

from pydantic import Field

from app.schemas.base import CamelModel


PrayerType = Literal[
    "subuh", "zohor", "asar", "maghrib", "isyak",
    "jumaat", "terawih", "iftar", "tahajjud", "others",
]

VerificationAction = Literal["upvote", "flag"]


# ── Visit / Langkah ───────────────────────────────────────────────────────────

class VisitCreate(CamelModel):
    masjid_id: uuid.UUID
    prayer_type: PrayerType
    visited_at: datetime | None = None          # defaults to server now()
    notes: str | None = Field(default=None, max_length=500)
    is_ramadan: bool = False


class VisitResponse(CamelModel):
    id: uuid.UUID
    user_id: uuid.UUID
    masjid_id: uuid.UUID
    prayer_type: PrayerType
    visited_at: datetime
    notes: str | None
    is_ramadan: bool
    created_at: datetime


# ── Verification ──────────────────────────────────────────────────────────────

class VerificationCreate(CamelModel):
    action: VerificationAction = "upvote"


class VerificationResponse(CamelModel):
    id: uuid.UUID
    user_id: uuid.UUID
    masjid_id: uuid.UUID
    action: VerificationAction
    created_at: datetime


# ── Review ────────────────────────────────────────────────────────────────────

class ReviewCreate(CamelModel):
    rating: int = Field(ge=1, le=5)
    comment: str | None = Field(default=None, max_length=2000)
    cleanliness_rating: int | None = Field(default=None, ge=1, le=5)
    facilities_rating: int | None = Field(default=None, ge=1, le=5)
    crowd_rating: int | None = Field(default=None, ge=1, le=5)


class ReviewUpdate(CamelModel):
    rating: int | None = Field(default=None, ge=1, le=5)
    comment: str | None = Field(default=None, max_length=2000)
    cleanliness_rating: int | None = Field(default=None, ge=1, le=5)
    facilities_rating: int | None = Field(default=None, ge=1, le=5)
    crowd_rating: int | None = Field(default=None, ge=1, le=5)


class ReviewResponse(CamelModel):
    id: uuid.UUID
    user_id: uuid.UUID
    masjid_id: uuid.UUID
    rating: int
    comment: str | None
    cleanliness_rating: int | None
    facilities_rating: int | None
    crowd_rating: int | None
    is_approved: bool
    created_at: datetime
    updated_at: datetime
