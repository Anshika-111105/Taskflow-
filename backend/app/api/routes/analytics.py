from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.services.analytics_service import AnalyticsService
from app.models.user import User

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("")
def get_analytics(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return AnalyticsService(db).get_analytics(user.id)
