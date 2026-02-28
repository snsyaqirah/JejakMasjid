from fastapi import APIRouter

from app.api.v1.endpoints import auth, masjids, reviews, users, visits

router = APIRouter(prefix="/api/v1")

router.include_router(auth.router,     prefix="/auth",    tags=["auth"])
router.include_router(users.router,    prefix="/users",   tags=["users"])
router.include_router(masjids.router,  prefix="/masjids", tags=["masjids"])
router.include_router(visits.router,   prefix="/visits",  tags=["visits"])
router.include_router(reviews.router,  prefix="/reviews", tags=["reviews"])
