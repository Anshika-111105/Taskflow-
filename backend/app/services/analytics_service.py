from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from app.models.task import Task, TaskHistory, StatusEnum, PriorityEnum, ActionTypeEnum
from datetime import datetime, timedelta, timezone
from collections import defaultdict

class AnalyticsService:
    def __init__(self, db: Session):
        self.db = db

    def get_analytics(self, user_id: int) -> dict:
        tasks = self.db.query(Task).filter(Task.user_id == user_id).all()
        total = len(tasks)
        completed = [t for t in tasks if t.status == StatusEnum.completed]
        completed_count = len(completed)
        completion_pct = round((completed_count / total * 100), 1) if total > 0 else 0

        # Tasks per day/week/month
        now = datetime.now(timezone.utc)
        completed_today = sum(1 for t in completed if t.updated_at and t.updated_at.date() == now.date())
        week_start = now - timedelta(days=7)
        completed_week = sum(1 for t in completed if t.updated_at and t.updated_at >= week_start)
        month_start = now.replace(day=1)
        completed_month = sum(1 for t in completed if t.updated_at and t.updated_at >= month_start)

        # Tasks completed per day (last 30 days)
        day_counts = defaultdict(int)
        for t in completed:
            if t.updated_at:
                day_counts[t.updated_at.strftime("%Y-%m-%d")] += 1

        # Most productive day
        most_productive = max(day_counts, key=day_counts.get) if day_counts else None
        most_productive_count = day_counts[most_productive] if most_productive else 0

        # Average completion time (created_at -> updated_at for completed tasks)
        completion_times = []
        for t in completed:
            if t.created_at and t.updated_at:
                delta = (t.updated_at - t.created_at).total_seconds() / 3600
                completion_times.append(delta)
        avg_completion_hours = round(sum(completion_times) / len(completion_times), 1) if completion_times else 0

        # Priority distribution
        priority_dist = {
            "Low": sum(1 for t in tasks if t.priority == PriorityEnum.low),
            "Medium": sum(1 for t in tasks if t.priority == PriorityEnum.medium),
            "High": sum(1 for t in tasks if t.priority == PriorityEnum.high),
        }

        # Productivity score formula:
        # Score = (completion_rate * 50) + (high_priority_completed / max(high_priority_total,1) * 30) + (on_time_rate * 20)
        high_priority = [t for t in tasks if t.priority == PriorityEnum.high]
        high_completed = [t for t in high_priority if t.status == StatusEnum.completed]
        hp_rate = len(high_completed) / max(len(high_priority), 1)

        on_time = sum(1 for t in completed if t.due_date and t.updated_at and t.updated_at <= t.due_date)
        tasks_with_due = [t for t in completed if t.due_date]
        on_time_rate = on_time / max(len(tasks_with_due), 1) if tasks_with_due else 0.5

        productivity_score = round(
            (completion_pct / 100 * 50) + (hp_rate * 30) + (on_time_rate * 20), 1
        )

        # Last 30 days chart data
        chart_data = []
        for i in range(29, -1, -1):
            d = (now - timedelta(days=i)).strftime("%Y-%m-%d")
            chart_data.append({"date": d, "completed": day_counts.get(d, 0)})

        return {
            "total_tasks": total,
            "completed_tasks": completed_count,
            "pending_tasks": sum(1 for t in tasks if t.status == StatusEnum.pending),
            "archived_tasks": sum(1 for t in tasks if t.status == StatusEnum.archived),
            "completion_percentage": completion_pct,
            "completed_today": completed_today,
            "completed_this_week": completed_week,
            "completed_this_month": completed_month,
            "most_productive_day": most_productive,
            "most_productive_day_count": most_productive_count,
            "average_completion_hours": avg_completion_hours,
            "priority_distribution": priority_dist,
            "productivity_score": productivity_score,
            "daily_chart_data": chart_data,
        }
