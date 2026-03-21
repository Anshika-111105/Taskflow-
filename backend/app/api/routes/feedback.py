from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.feedback import FeedbackCreate, FeedbackOut
from app.models.feedback import Feedback
from app.models.user import User

router = APIRouter(prefix="/feedback", tags=["Feedback"])

@router.post("", response_model=FeedbackOut)
def submit_feedback(data: FeedbackCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    fb = Feedback(user_id=user.id, task_id=data.task_id, comment=data.comment, rating=data.rating)
    db.add(fb); db.commit(); db.refresh(fb)
    return fb

@router.get("", response_model=list[FeedbackOut])
def get_feedback(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(Feedback).filter(Feedback.user_id == user.id).order_by(Feedback.created_at.desc()).all()
