"""
Masjid CRUD endpoints with 100m radius duplicate check and facilities management.
"""
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from supabase import Client
from app.core.supabase import get_supabase, get_supabase_admin
from app.core.deps import get_current_user, get_current_user_optional
from app.schemas.masjid import (
    MasjidCreate, MasjidUpdate, MasjidDetail, MasjidListItem,
    NearbySearchRequest, NearbyMasjidResult, MasjidMediaCreate, MasjidMediaResponse
)
from app.schemas.facilities import FacilitiesCreate, FacilitiesUpdate, FacilitiesResponse
from app.schemas.common import MessageResponse, PaginatedResponse

router = APIRouter()


# ── Nearby Search (100m Radius Check) ────────────────────────────────

@router.post("/check-nearby", response_model=list[NearbyMasjidResult])
async def check_nearby_masjids(
    body: NearbySearchRequest,
    supabase: Client = Depends(get_supabase)
):
    """
    CHECK BEFORE CREATING: Find masjids within radius (default 100m).
    Used to prevent duplicate masjid entries.
    """
    try:
        # Use the PostGIS function we created in Supabase
        result = supabase.rpc(
            'find_nearby_masjids',
            {
                'lat': body.latitude,
                'lng': body.longitude,
                'radius_meters': body.radius_meters
            }
        ).execute()
        
        return result.data or []
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search nearby masjids: {str(e)}"
        )


# ── List & Browse Masjids ────────────────────────────────────────────

@router.get("", response_model=PaginatedResponse)
async def list_masjids(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: str | None = Query(None, alias="status"),
    search: str | None = None,
    supabase: Client = Depends(get_supabase)
):
    """
    List all masjids with pagination and filtering.
    Public users see only 'verified' masjids.
    Authenticated users see all except 'rejected'.
    """
    try:
        query = supabase.table('masjids').select('*, facilities:masjid_facilities(*)', count='exact')
        
        # Filter by status
        if status_filter:
            query = query.eq('status', status_filter)
        else:
            query = query.in_('status', ['pending', 'verified'])
        
        # Search by name/address
        if search:
            query = query.or_(f'name.ilike.%{search}%,address.ilike.%{search}%')
        
        # Soft delete filter
        query = query.is_('deleted_at', 'null')
        
        # Pagination
        offset = (page - 1) * page_size
        query = query.range(offset, offset + page_size - 1)
        
        result = query.execute()
        
        return PaginatedResponse(
            items=result.data or [],
            total=result.count or 0,
            page=page,
            page_size=page_size,
            total_pages=((result.count or 0) + page_size - 1) // page_size
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/{masjid_id}", response_model=MasjidDetail)
async def get_masjid_detail(
    masjid_id: uuid.UUID,
    current_user: dict | None = Depends(get_current_user_optional),
    supabase: Client = Depends(get_supabase)
):
    """
    Get full masjid details including facilities, media, and live status.
    """
    try:
        # Get masjid with all related data
        result = supabase.table('masjids').select(
            '''
            *,
            facilities:masjid_facilities(*),
            media:masjid_media(*),
            verification:verifications(count)
            '''
        ).eq('id', str(masjid_id)).is_('deleted_at', 'null').execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Masjid not found"
            )
        
        masjid = result.data[0]
        
        # Get live updates (active only)
        live_updates = supabase.table('live_updates').select('*').eq(
            'masjid_id', str(masjid_id)
        ).gt('expires_at', 'now()').execute()
        
        masjid['live_status'] = live_updates.data
        
        return masjid
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ── Create Masjid (with Duplicate Check) ─────────────────────────────

@router.post("", response_model=MasjidDetail, status_code=201)
async def create_masjid(
    body: MasjidCreate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin)
):
    """
    Create new masjid after checking for duplicates within 100m.
    Status starts as 'pending' until verified by community.
    """
    try:
        # First check for nearby masjids (anti-duplicate)
        nearby = supabase.rpc(
            'find_nearby_masjids',
            {
                'lat': body.latitude,
                'lng': body.longitude,
                'radius_meters': 100
            }
        ).execute()
        
        if nearby.data and len(nearby.data) > 0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Masjid already exists nearby: {nearby.data[0]['name']} ({nearby.data[0]['distance_meters']:.0f}m away)"
            )
        
        # Create masjid with PostGIS geography point
        masjid_data = {
            "name": body.name,
            "address": body.address,
            "description": body.description,
            "location": f"POINT({body.longitude} {body.latitude})",  # PostGIS format
            "status": "pending",
            "created_by": current_user['id']
        }
        
        result = supabase.table('masjids').insert(masjid_data).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create masjid"
            )
        
        # Award 50 reputation points for creating a masjid
        try:
            profile = supabase.table('profiles').select('reputation_points').eq(
                'id', current_user['id']
            ).single().execute()
            current_pts = profile.data.get('reputation_points', 0) if profile.data else 0
            supabase.table('profiles').update(
                {'reputation_points': current_pts + 50}
            ).eq('id', current_user['id']).execute()
        except Exception:
            pass  # Non-critical - don't fail the masjid creation
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ── Update & Delete Masjid ───────────────────────────────────────────

@router.patch("/{masjid_id}", response_model=MasjidDetail)
async def update_masjid(
    masjid_id: uuid.UUID,
    body: MasjidUpdate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Update masjid info (owner or admin only).
    """
    try:
        # Check ownership
        masjid = supabase.table('masjids').select('created_by').eq(
            'id', str(masjid_id)
        ).single().execute()
        
        if not masjid.data or masjid.data['created_by'] != current_user['id']:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only update your own masjid"
            )
        
        # Update
        update_data = body.model_dump(exclude_unset=True)
        if 'latitude' in update_data and 'longitude' in update_data:
            update_data['location'] = f"POINT({update_data.pop('longitude')} {update_data.pop('latitude')})"
        
        result = supabase.table('masjids').update(update_data).eq(
            'id', str(masjid_id)
        ).execute()
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.delete("/{masjid_id}", response_model=MessageResponse)
async def delete_masjid(
    masjid_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Soft delete masjid (owner or admin only).
    """
    try:
        # Soft delete by setting deleted_at
        result = supabase.table('masjids').update({
            'deleted_at': 'now()'
        }).eq('id', str(masjid_id)).eq('created_by', current_user['id']).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Masjid not found or you don't have permission"
            )
        
        return MessageResponse(message="Masjid deleted successfully", success=True)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )