from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Any
from app.models.task import PriorityEnum, StatusEnum, ActionTypeEnum

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: PriorityEnum = PriorityEnum.medium
    due_date: Optional[datetime] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[PriorityEnum] = None
    status: Optional[StatusEnum] = None
    due_date: Optional[datetime] = None

class TaskOut(BaseModel):
    id: int
    user_id: int
    title: str
    description: Optional[str]
    priority: PriorityEnum
    status: StatusEnum
    due_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TaskHistoryOut(BaseModel):
    id: int
    task_id: int
    action_type: ActionTypeEnum
    previous_state: Optional[Any]
    timestamp: datetime

    class Config:
        from_attributes = True

class TaskFilter(BaseModel):
    priority: Optional[PriorityEnum] = None
    status: Optional[StatusEnum] = None
    due_date_from: Optional[datetime] = None
    due_date_to: Optional[datetime] = None
    page: int = 1
    page_size: int = 20
