from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.task import Task, TaskHistory, StatusEnum, PriorityEnum, ActionTypeEnum
from typing import Optional, List, Tuple
from datetime import datetime

class TaskRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, user_id: int, title: str, description: Optional[str],
               priority: PriorityEnum, due_date: Optional[datetime]) -> Task:
        task = Task(user_id=user_id, title=title, description=description,
                    priority=priority, due_date=due_date)
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        self._add_history(task.id, ActionTypeEnum.created, None)
        return task

    def get_by_id(self, task_id: int, user_id: int) -> Optional[Task]:
        return self.db.query(Task).filter(
            Task.id == task_id, Task.user_id == user_id
        ).first()

    def get_all(self, user_id: int, priority: Optional[PriorityEnum] = None,
                status: Optional[StatusEnum] = None,
                due_date_from: Optional[datetime] = None,
                due_date_to: Optional[datetime] = None,
                page: int = 1, page_size: int = 20) -> Tuple[List[Task], int]:
        query = self.db.query(Task).filter(Task.user_id == user_id)
        if priority:
            query = query.filter(Task.priority == priority)
        if status:
            query = query.filter(Task.status == status)
        if due_date_from:
            query = query.filter(Task.due_date >= due_date_from)
        if due_date_to:
            query = query.filter(Task.due_date <= due_date_to)
        total = query.count()
        tasks = query.order_by(Task.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
        return tasks, total

    def update(self, task: Task, **kwargs) -> Task:
        prev_state = {
            "title": task.title, "description": task.description,
            "priority": task.priority.value if task.priority else None,
            "status": task.status.value if task.status else None,
            "due_date": task.due_date.isoformat() if task.due_date else None
        }
        action = ActionTypeEnum.updated
        for key, value in kwargs.items():
            if value is not None:
                if key == "status" and value == StatusEnum.completed:
                    action = ActionTypeEnum.completed
                setattr(task, key, value)
        self.db.commit()
        self.db.refresh(task)
        self._add_history(task.id, action, prev_state)
        return task

    def delete(self, task: Task):
        prev_state = {
            "title": task.title, "status": task.status.value if task.status else None
        }
        self._add_history(task.id, ActionTypeEnum.deleted, prev_state)
        self.db.delete(task)
        self.db.commit()

    def _add_history(self, task_id: int, action: ActionTypeEnum, prev_state: Optional[dict]):
        history = TaskHistory(task_id=task_id, action_type=action, previous_state=prev_state)
        self.db.add(history)
        self.db.commit()

    def get_history(self, task_id: int, user_id: int) -> List[TaskHistory]:
        task = self.get_by_id(task_id, user_id)
        if not task:
            return []
        return self.db.query(TaskHistory).filter(
            TaskHistory.task_id == task_id
        ).order_by(TaskHistory.timestamp.desc()).all()

    def get_all_for_analytics(self, user_id: int) -> List[Task]:
        return self.db.query(Task).filter(Task.user_id == user_id).all()
