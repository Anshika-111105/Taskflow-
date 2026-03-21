from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class FeedbackCreate(BaseModel):
    task_id: Optional[int] = None
    comment: str
    rating: int = Field(..., ge=1, le=5)

class FeedbackOut(BaseModel):
    id: int
    user_id: int
    task_id: Optional[int]
    comment: str
    rating: int
    created_at: datetime

    class Config:
        from_attributes = True
