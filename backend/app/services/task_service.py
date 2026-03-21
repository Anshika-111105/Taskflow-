from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.repositories.task_repository import TaskRepository
from app.schemas.task import TaskCreate, TaskUpdate, TaskFilter
from app.models.task import StatusEnum

class TaskService:
    def __init__(self, db: Session):
        self.repo = TaskRepository(db)

    def create_task(self, user_id: int, data: TaskCreate):
        return self.repo.create(
            user_id=user_id, title=data.title, description=data.description,
            priority=data.priority, due_date=data.due_date
        )

    def get_tasks(self, user_id: int, filters: TaskFilter):
        tasks, total = self.repo.get_all(
            user_id=user_id, priority=filters.priority, status=filters.status,
            due_date_from=filters.due_date_from, due_date_to=filters.due_date_to,
            page=filters.page, page_size=filters.page_size
        )
        return {"tasks": tasks, "total": total, "page": filters.page, "page_size": filters.page_size}

    def get_task(self, user_id: int, task_id: int):
        task = self.repo.get_by_id(task_id, user_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        return task

    def update_task(self, user_id: int, task_id: int, data: TaskUpdate):
        task = self.get_task(user_id, task_id)
        updates = data.model_dump(exclude_unset=True)
        return self.repo.update(task, **updates)

    def delete_task(self, user_id: int, task_id: int):
        task = self.get_task(user_id, task_id)
        self.repo.delete(task)
        return {"message": "Task deleted"}

    def get_history(self, user_id: int, task_id: int):
        self.get_task(user_id, task_id)
        return self.repo.get_history(task_id, user_id)
