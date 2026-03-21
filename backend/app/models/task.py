from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, JSON, func
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base

class PriorityEnum(str, enum.Enum):
    low = "Low"
    medium = "Medium"
    high = "High"

class StatusEnum(str, enum.Enum):
    pending = "Pending"
    completed = "Completed"
    archived = "Archived"

class ActionTypeEnum(str, enum.Enum):
    created = "created"
    updated = "updated"
    completed = "completed"
    deleted = "deleted"

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    priority = Column(Enum(PriorityEnum), default=PriorityEnum.medium, nullable=False)
    status = Column(Enum(StatusEnum), default=StatusEnum.pending, nullable=False)
    due_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    history = relationship("TaskHistory", back_populates="task", cascade="all, delete-orphan")
    feedback = relationship("Feedback", back_populates="task", cascade="all, delete-orphan")

class TaskHistory(Base):
    __tablename__ = "task_history"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    action_type = Column(Enum(ActionTypeEnum), nullable=False)
    previous_state = Column(JSON, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    task = relationship("Task", back_populates="history")
