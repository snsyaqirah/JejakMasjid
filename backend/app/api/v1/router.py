from fastapi import APIRouter

from app.api.v1.endpoints import auth, masjids_new
from app.api.v1.endpoints import checkin, live_updates_new, verification_new, dashboard, facilities_new

router = APIRouter(prefix="/api/v1")

router.include_router(auth.router,                prefix="/auth",          tags=["auth"])
router.include_router(masjids_new.router,         prefix="/masjids",        tags=["masjids"])
router.include_router(checkin.router,             prefix="/checkins",       tags=["check-in"])
router.include_router(live_updates_new.router,    prefix="/live-updates",   tags=["live-updates"])
router.include_router(verification_new.router,    prefix="/verifications",  tags=["verifications"])
router.include_router(dashboard.router,           prefix="/dashboard",      tags=["dashboard"])
router.include_router(facilities_new.router,      prefix="/facilities",     tags=["facilities"])
