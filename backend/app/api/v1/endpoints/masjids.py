import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.activity import ReviewResponse, VerificationCreate, VerificationResponse, VisitResponse
from app.schemas.common import MessageResponse, PaginatedResponse
from app.schemas.masjid import MasjidCreate, MasjidDetail, MasjidSummary, MasjidUpdate, NearbyQuery

router = APIRouter()


# ── Public browsing ───────────────────────────────────────────────────────────

@router.get("", response_model=PaginatedResponse[MasjidSummary])
async def list_masjids(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    city: str | None = None,
    state: str | None = None,
    status: str | None = None,
    search: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    """
    Senarai semua masjid.
    Supports filtering by city, state, status, and full-text search.
    """
    raise NotImplementedError


@router.get("/nearby", response_model=list[MasjidSummary])
async def nearby_masjids(
    query: NearbyQuery = Depends(),
    db: AsyncSession = Depends(get_db),
):
    """
    Return masjids within `radius_meters` of the given coordinates.
    Also used by the duplicate-check before submitting a new entry.
    Uses the Haversine formula in SQL.
    """
    raise NotImplementedError


@router.get("/{slug}", response_model=MasjidDetail)
async def get_masjid(slug: str, db: AsyncSession = Depends(get_db)):
    """Butiran penuh sebuah masjid."""
    raise NotImplementedError


# ── Authenticated actions ─────────────────────────────────────────────────────

@router.post("", response_model=MasjidDetail, status_code=201)
async def create_masjid(
    body: MasjidCreate,
    db: AsyncSession = Depends(get_db),
    # current_user = Depends(get_current_user),  # uncomment after auth impl
):
    """
    Cadang masjid baru.
    Soft-published as "unverified". Duplicate check (100m radius) happens here.
    """
    raise NotImplementedError


@router.patch("/{masjid_id}", response_model=MasjidDetail)
async def update_masjid(
    masjid_id: uuid.UUID,
    body: MasjidUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Kemaskini maklumat masjid (submitter or moderator/admin only)."""
    raise NotImplementedError


@router.delete("/{masjid_id}", response_model=MessageResponse)
async def delete_masjid(masjid_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Soft-delete a masjid (admin only). Sets deleted_at timestamp."""
    raise NotImplementedError


# ── Peer Review / Verification ────────────────────────────────────────────────

@router.post("/{masjid_id}/verify", response_model=VerificationResponse, status_code=201)
async def verify_masjid(
    masjid_id: uuid.UUID,
    body: VerificationCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Upvote or flag a masjid entry.
    - upvote: increments verification_count; auto-verifies at threshold (3).
    - flag: routes to moderator queue.
    A user can only vote once per masjid (unique constraint enforced in DB).
    """
    raise NotImplementedError


# ── Reviews ───────────────────────────────────────────────────────────────────

@router.get("/{masjid_id}/reviews", response_model=PaginatedResponse[ReviewResponse])
async def list_reviews(
    masjid_id: uuid.UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    """Ulasan komuniti untuk masjid ini."""
    raise NotImplementedError


@router.post("/{masjid_id}/reviews", response_model=ReviewResponse, status_code=201)
async def create_review(
    masjid_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Tulis ulasan untuk masjid ini."""
    raise NotImplementedError


# ── Visit history ─────────────────────────────────────────────────────────────

@router.get("/{masjid_id}/visits", response_model=PaginatedResponse[VisitResponse])
async def masjid_visit_history(
    masjid_id: uuid.UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Senarai 'langkah' terkini di masjid ini."""
    raise NotImplementedError
