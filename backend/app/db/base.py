from app.models.base import Base
from app.models.masjid import Masjid
from app.models.review import Review
from app.models.user import User
from app.models.verification import Verification
from app.models.visit import Visit

# Import all models here so Alembic can discover them via Base.metadata
__all__ = ["Base", "User", "Masjid", "Visit", "Verification", "Review"]
