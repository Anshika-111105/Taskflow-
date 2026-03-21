from app.core.database import SessionLocal
from app.models.user import User
from app.models.task import Task, PriorityEnum, StatusEnum
from app.models.feedback import Feedback
from app.core.security import get_password_hash
from datetime import datetime, timezone, timedelta

def seed():
    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(User).filter(User.email == "demo@taskflow.com").first():
            print("Seed data already exists!")
            return

        # Create demo user
        user = User(
            name="Demo User",
            email="demo@taskflow.com",
            password=get_password_hash("demo1234")
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # Create tasks
        tasks = [
            Task(user_id=user.id, title="Setup project repository", priority=PriorityEnum.high, status=StatusEnum.completed),
            Task(user_id=user.id, title="Design database schema", priority=PriorityEnum.high, status=StatusEnum.completed),
            Task(user_id=user.id, title="Implement JWT authentication", priority=PriorityEnum.high, status=StatusEnum.completed),
            Task(user_id=user.id, title="Build analytics dashboard", priority=PriorityEnum.medium, status=StatusEnum.completed),
            Task(user_id=user.id, title="Write API documentation", priority=PriorityEnum.medium, status=StatusEnum.pending),
            Task(user_id=user.id, title="Add unit tests", priority=PriorityEnum.low, status=StatusEnum.pending),
            Task(user_id=user.id, title="Deploy to production", priority=PriorityEnum.high, status=StatusEnum.pending,
                 due_date=datetime.now(timezone.utc) + timedelta(days=3)),
        ]
        for t in tasks:
            db.add(t)
        db.commit()

        # Add feedback
        feedback = Feedback(user_id=user.id, comment="Great task management system!", rating=5)
        db.add(feedback)
        db.commit()

        print("✅ Seed data created successfully!")
        print("   Login: demo@taskflow.com / demo1234")
    finally:
        db.close()

if __name__ == "__main__":
    seed()