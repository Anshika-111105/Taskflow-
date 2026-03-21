from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.services.task_service import TaskService
from app.schemas.task import TaskCreate, TaskUpdate, TaskOut, TaskHistoryOut, TaskFilter
from app.models.task import PriorityEnum, StatusEnum
from app.models.user import User
from datetime import datetime

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.post("", response_model=TaskOut)
def create_task(data: TaskCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return TaskService(db).create_task(user.id, data)

@router.get("")
def get_tasks(
    priority: Optional[PriorityEnum] = Query(None),
    status: Optional[StatusEnum] = Query(None),
    due_date_from: Optional[datetime] = Query(None),
    due_date_to: Optional[datetime] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    filters = TaskFilter(priority=priority, status=status, due_date_from=due_date_from,
                         due_date_to=due_date_to, page=page, page_size=page_size)
    return TaskService(db).get_tasks(user.id, filters)

@router.get("/{task_id}", response_model=TaskOut)
def get_task(task_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return TaskService(db).get_task(user.id, task_id)

@router.put("/{task_id}", response_model=TaskOut)
def update_task(task_id: int, data: TaskUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return TaskService(db).update_task(user.id, task_id, data)

@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return TaskService(db).delete_task(user.id, task_id)

@router.get("/{task_id}/history", response_model=List[TaskHistoryOut])
def get_history(task_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return TaskService(db).get_history(user.id, task_id)
