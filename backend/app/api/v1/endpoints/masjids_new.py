"""
Masjid CRUD endpoints with 100m radius duplicate check and facilities management.
"""
import uuid
import struct
from typing import Literal
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
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


class _MediaAddBody(BaseModel):
    media_type: Literal["main_photo", "toilet_photo", "interior_photo", "qr_tng", "qr_duitnow", "masjid_board"]
    url: str


def parse_ewkb_point(hex_str: str) -> tuple[float, float]:
    """Parse PostGIS EWKB hex string to (longitude, latitude)."""
    data = bytes.fromhex(hex_str)
    byte_order = data[0]
    endian = '<' if byte_order == 1 else '>'
    # geom_type is 4 bytes; check bit 0x20000000 for SRID presence
    geom_type = struct.unpack_from(f'{endian}I', data, 1)[0]
    has_srid = bool(geom_type & 0x20000000)
    offset = 1 + 4 + (4 if has_srid else 0)  # byte_order + type + optional SRID
    lng, lat = struct.unpack_from(f'{endian}dd', data, offset)
    return lng, lat


# ── Nearby Search (100m Radius Check) ────────────────────────────────

@router.post("/check-nearby", response_model=list[NearbyMasjidResult])
async def check_nearby_masjids(
    body: NearbySearchRequest,
    supabase: Client = Depends(get_supabase_admin)
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
    supabase: Client = Depends(get_supabase_admin)
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


@router.get("/stats", response_model=dict)
async def get_masjid_stats(
    supabase: Client = Depends(get_supabase_admin)
):
    """
    Public stats for the homepage: total masjids, verified count, and total visits.
    """
    try:
        masjids_res = supabase.table('masjids').select(
            'id, status', count='exact'
        ).is_('deleted_at', 'null').execute()

        rows = masjids_res.data or []
        total_masjids = masjids_res.count or len(rows)
        verified_masjids = sum(1 for r in rows if r.get('status') == 'verified')

        visits_res = supabase.table('user_visits').select(
            'id', count='exact'
        ).is_('deleted_at', 'null').execute()
        total_visits = visits_res.count or 0

        return {
            "total_masjids": total_masjids,
            "verified_masjids": verified_masjids,
            "total_visits": total_visits,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/{masjid_id}")
async def get_masjid_detail(
    masjid_id: uuid.UUID,
    current_user: dict | None = Depends(get_current_user_optional),
    supabase: Client = Depends(get_supabase_admin)
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

        # Parse lat/lng from PostGIS EWKB hex
        try:
            lng, lat = parse_ewkb_point(masjid['location'])
        except Exception:
            lng, lat = 0.0, 0.0

        # facilities join returns a list — take first item or None
        raw_facilities = masjid.get('facilities')
        facilities = raw_facilities[0] if isinstance(raw_facilities, list) and raw_facilities else (
            raw_facilities if isinstance(raw_facilities, dict) else None
        )

        # media join returns a list
        media = masjid.get('media') or []

        # Get live updates (active only) — set to None when empty
        live_updates = supabase.table('live_updates').select('*').eq(
            'masjid_id', str(masjid_id)
        ).gt('expires_at', 'now()').execute()
        live_status = live_updates.data[0] if live_updates.data else None

        # Build verification object from masjid row data
        verification = {
            'masjid_id': masjid['id'],
            'status': masjid['status'],
            'verification_count': masjid.get('verification_count', 0),
            'needed_for_verification': 3,
            'user_has_voted': False,
            'user_vote_type': None,
        }

        return {
            **masjid,
            'latitude': lat,
            'longitude': lng,
            'facilities': facilities,
            'media': media,
            'live_status': live_status,
            'verification': verification,
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ── Create Masjid (with Duplicate Check) ─────────────────────────────

@router.post("", status_code=201)
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

        # Build full MasjidDetail response — DB row lacks lat/lng (stored as PostGIS)
        # and related tables are empty on a brand-new masjid
        row = result.data[0]
        return {
            **row,
            "latitude": body.latitude,
            "longitude": body.longitude,
            "facilities": None,
            "media": [],
            "live_status": None,
            "verification": {
                "masjid_id": row["id"],
                "status": row["status"],
                "verification_count": 0,
                "needed_for_verification": 3,
                "user_has_voted": False,
                "user_vote_type": None,
            },
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ── Update & Delete Masjid ───────────────────────────────────────────

@router.patch("/{masjid_id}")
async def update_masjid(
    masjid_id: uuid.UUID,
    body: MasjidUpdate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin)
):
    """
    Update masjid info (owner or admin only).
    """
    try:
        # Check ownership
        masjid = supabase.table('masjids').select('created_by').eq(
            'id', str(masjid_id)
        ).execute()
        
        if not masjid.data or masjid.data[0]['created_by'] != current_user['id']:
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


# ── Media (Photos & QR codes) ─────────────────────────────────────────

@router.get("/{masjid_id}/media", response_model=list[MasjidMediaResponse])
async def get_masjid_media(
    masjid_id: uuid.UUID,
    supabase: Client = Depends(get_supabase_admin),
):
    """Get all media items for a masjid (public)."""
    result = supabase.table('masjid_media').select('*').eq(
        'masjid_id', str(masjid_id)
    ).is_('deleted_at', 'null').order('created_at').execute()
    return result.data or []


@router.post("/{masjid_id}/media", response_model=MasjidMediaResponse, status_code=201)
async def add_masjid_media(
    masjid_id: uuid.UUID,
    body: _MediaAddBody,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin),
):
    """Add a photo or QR code URL for a masjid. Awards +5 reputation."""
    masjid_id_str = str(masjid_id)

    # Verify masjid exists
    masjid_res = supabase.table('masjids').select('id').eq(
        'id', masjid_id_str
    ).is_('deleted_at', 'null').execute()
    if not masjid_res.data:
        raise HTTPException(status_code=404, detail="Masjid tidak dijumpai")

    if not body.url.startswith(('http://', 'https://')):
        raise HTTPException(status_code=422, detail="URL gambar tidak sah")

    result = supabase.table('masjid_media').insert({
        'masjid_id': masjid_id_str,
        'media_type': body.media_type,
        'url': body.url,
        'created_by': current_user['id'],
    }).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Gagal menyimpan gambar")

    # Award +5 reputation for contributing
    try:
        prof = supabase.table('profiles').select('reputation_points').eq(
            'id', current_user['id']
        ).single().execute()
        pts = prof.data.get('reputation_points', 0) if prof.data else 0
        supabase.table('profiles').update({'reputation_points': pts + 5}).eq(
            'id', current_user['id']
        ).execute()
    except Exception:
        pass

    return result.data[0]


@router.delete("/{masjid_id}/media/{media_id}", response_model=MessageResponse)
async def delete_masjid_media(
    masjid_id: uuid.UUID,
    media_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin),
):
    """Soft-delete a media item (only uploader can delete)."""
    result = supabase.table('masjid_media').update({'deleted_at': 'now()'}).eq(
        'id', str(media_id)
    ).eq('masjid_id', str(masjid_id)).eq('created_by', current_user['id']).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Gambar tidak dijumpai atau tiada kebenaran")

    return MessageResponse(message="Gambar dipadam", success=True)


@router.delete("/{masjid_id}", response_model=MessageResponse)
async def delete_masjid(
    masjid_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin)
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