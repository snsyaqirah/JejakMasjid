from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.activity import VisitCreate, VisitResponse
from app.schemas.common import MessageResponse, PaginatedResponse

router = APIRouter()


@router.post("", response_model=VisitResponse, status_code=201)
async def check_in(body: VisitCreate, db: AsyncSession = Depends(get_db)):
    """
    Rakam 'Langkah' — check in ke masjid untuk solat/terawih/iftar.
    """
    raise NotImplementedError


@router.get("/me", response_model=PaginatedResponse[VisitResponse])
async def my_visits(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    prayer_type: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    """
    Sejarah langkah saya — personal spiritual journey log.
    Filterable by prayer_type.
    """
    raise NotImplementedError


@router.delete("/{visit_id}", response_model=MessageResponse)
async def delete_visit(visit_id: str, db: AsyncSession = Depends(get_db)):
    """Padam rekod langkah (own record only)."""
    raise NotImplementedError
