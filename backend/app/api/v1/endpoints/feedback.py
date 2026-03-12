from fastapi import APIRouter, Depends, HTTPException
from pydantic import Field
from typing import Optional
from app.schemas.base import CamelModel
from app.core.supabase import get_supabase_admin
from app.core.deps import get_current_user_optional, get_current_user
from supabase import Client

router = APIRouter()


class FeedbackCreate(CamelModel):
    message: str = Field(min_length=5, max_length=1000)
    rating: Optional[int] = Field(None, ge=1, le=5)
    page_url: Optional[str] = None
    name: Optional[str] = Field(None, max_length=100)


class FeedbackResponse(CamelModel):
    id: str
    message: str


@router.post("", response_model=FeedbackResponse, status_code=201)
async def submit_feedback(
    body: FeedbackCreate,
    supabase: Client = Depends(get_supabase_admin),
    current_user: Optional[dict] = Depends(get_current_user_optional),
):
    """Submit app feedback. Open to all users (logged in or not)."""
    payload = {
        "message": body.message,
        "rating": body.rating,
        "page_url": body.page_url,
        "name": body.name,
        "user_id": current_user["id"] if current_user else None,
    }
    result = supabase.table("feedback").insert(payload).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Gagal menyimpan maklum balas")
    return result.data[0]


@router.get("/admin")
async def list_feedback(
    supabase: Client = Depends(get_supabase_admin),
    current_user: dict = Depends(get_current_user),
):
    """Admin only: list all feedback sorted newest first."""
    prof = supabase.table("profiles").select("is_admin").eq("id", current_user["id"]).single().execute()
    if not (prof.data and prof.data.get("is_admin")):
        raise HTTPException(status_code=403, detail="Akses ditolak")
    result = supabase.table("feedback").select("*").order("created_at", desc=True).limit(200).execute()
    return result.data or []
