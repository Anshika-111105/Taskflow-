# TaskFlow — Full Stack Task Management System

A production-grade task management system with JWT authentication, historical tracking, and analytics dashboard.

**Stack:** FastAPI · PostgreSQL · React 18 · TypeScript · Tailwind CSS · Recharts

---

## Quick Start (Local)

### Prerequisites
- Python 3.11+
- Node.js 20+
- PostgreSQL 14+ running locally

---

### 1. Clone / unzip the project

```bash
cd taskflow
```

---

### 2. PostgreSQL — Create database

```bash
psql -U postgres
CREATE DATABASE taskflow;
\q
```

---

### 3. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env — update DATABASE_URL if your postgres user/password differ

# Run the server
python main.py
# OR
uvicorn app.main:app --reload --port 8000
```

**Backend runs at:** http://localhost:8000  
**Swagger docs:** http://localhost:8000/api/docs

> Tables are auto-created on first startup via SQLAlchemy `create_all`.  
> For migrations with Alembic: `alembic revision --autogenerate -m "init"` then `alembic upgrade head`

---

### 4. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

**Frontend runs at:** http://localhost:5173

---

### 5. Docker Compose (alternative — runs everything)

```bash
# From project root
docker compose up --build
```

Services:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- PostgreSQL: localhost:5432

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres:password@localhost:5432/taskflow` | PostgreSQL connection string |
| `SECRET_KEY` | *(set a long random string)* | JWT signing key |
| `ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Access token TTL |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` | Refresh token TTL |
| `BACKEND_CORS_ORIGINS` | `["http://localhost:5173"]` | Allowed CORS origins (JSON array) |

---

## JWT Flow

```
1. User registers/logs in → backend issues:
   - access_token  (short-lived: 30 min, type="access")
   - refresh_token (long-lived: 7 days, type="refresh")

2. Frontend stores both in localStorage.

3. Every API request attaches: Authorization: Bearer <access_token>

4. Axios interceptor catches 401 responses:
   → POST /api/auth/refresh with refresh_token
   → Receives new access_token + refresh_token
   → Retries the original request transparently

5. If refresh also fails → localStorage cleared → redirect to /login
```

Token payload structure:
```json
{ "sub": "<user_id>", "exp": <unix_timestamp>, "type": "access|refresh" }
```

---

## Database Schema

```
users
  id | name | email (unique) | password (bcrypt) | created_at

tasks
  id | user_id (FK→users) | title | description | priority (Low/Medium/High)
     | status (Pending/Completed/Archived) | due_date | created_at | updated_at

task_history
  id | task_id (FK→tasks) | action_type (created/updated/completed/deleted)
     | previous_state (JSON) | timestamp

feedback
  id | user_id (FK→users) | task_id (FK→tasks, nullable)
     | comment | rating (1-5) | created_at
```

**Indexes:** `tasks.user_id`, `tasks.priority`, `tasks.status`, `task_history.task_id`, `feedback.user_id`

**Relationships:**
- User → Tasks: one-to-many (cascade delete)
- Task → TaskHistory: one-to-many (cascade delete)
- Task → Feedback: one-to-many (cascade delete)
- User → Feedback: one-to-many (cascade delete)

---

## Analytics Logic

`GET /api/analytics` returns:

| Field | Calculation |
|---|---|
| `completion_percentage` | `completed / total * 100` |
| `completed_today/week/month` | Count by `updated_at` window |
| `most_productive_day` | Day with max completions |
| `average_completion_hours` | Avg of `(updated_at - created_at)` for completed tasks |
| `priority_distribution` | Group-count by priority enum |
| `daily_chart_data` | Per-day completed count, last 30 days |

### Productivity Score Formula

```
Score = (completion_rate × 50)
      + (high_priority_completion_rate × 30)
      + (on_time_completion_rate × 20)

Max = 100
≥ 70 → High performer
40–69 → Average
< 40 → Needs improvement
```

- **completion_rate** = completed_tasks / total_tasks
- **high_priority_completion_rate** = completed High-priority tasks / all High-priority tasks
- **on_time_completion_rate** = tasks completed before due_date / all completed tasks with due_date (defaults to 0.5 if no due dates set)

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ✗ | Register user |
| POST | `/api/auth/login` | ✗ | Login, get tokens |
| POST | `/api/auth/refresh` | ✗ | Refresh access token |
| GET | `/api/tasks` | ✓ | List tasks (filter + paginate) |
| POST | `/api/tasks` | ✓ | Create task |
| GET | `/api/tasks/{id}` | ✓ | Get task by ID |
| PUT | `/api/tasks/{id}` | ✓ | Update task |
| DELETE | `/api/tasks/{id}` | ✓ | Delete task |
| GET | `/api/tasks/{id}/history` | ✓ | Task history |
| GET | `/api/analytics` | ✓ | Analytics data |
| POST | `/api/feedback` | ✓ | Submit feedback |
| GET | `/api/feedback` | ✓ | Get my feedback |
| GET | `/api/docs` | ✗ | Swagger UI |

---

## Backend Architecture

```
backend/
├── app/
│   ├── api/routes/        # FastAPI route handlers (auth, tasks, analytics, feedback)
│   ├── models/            # SQLAlchemy ORM models
│   ├── schemas/           # Pydantic request/response schemas
│   ├── services/          # Business logic layer
│   ├── repositories/      # Database access layer
│   ├── core/              # Security, DB session, dependencies
│   ├── config/            # Settings via pydantic-settings
│   └── main.py            # FastAPI app factory + CORS + router registration
├── migrations/            # Alembic migration scripts
└── main.py                # Uvicorn entrypoint
```

**Separation of concerns:**
- Routes → validate HTTP, call services
- Services → business rules, error raising
- Repositories → raw DB queries, history tracking
- Models → ORM table definitions
- Schemas → I/O contracts (Pydantic)

---

## Frontend Architecture

```
frontend/src/
├── pages/          # LoginPage, SignupPage, DashboardPage, TasksPage, AnalyticsPage
├── components/
│   ├── layout/     # Sidebar, Layout (Outlet wrapper)
│   ├── tasks/      # TaskCard, TaskModal, HistoryModal
│   └── charts/     # (recharts used inline in AnalyticsPage)
├── services/       # axios wrappers per domain (auth, tasks, analytics, feedback)
├── store/          # Zustand auth store
├── types/          # TypeScript interfaces
└── index.css       # Tailwind + component classes
```

---

## Seed Data (optional)

```bash
cd backend
python -c "
from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.user import User
from app.models.task import Task, PriorityEnum, StatusEnum

db = SessionLocal()
u = User(name='Demo User', email='demo@taskflow.io', password=get_password_hash('demo1234'))
db.add(u); db.commit(); db.refresh(u)

for i, (title, pri, sta) in enumerate([
    ('Design landing page', PriorityEnum.high, StatusEnum.completed),
    ('Write unit tests', PriorityEnum.medium, StatusEnum.pending),
    ('Deploy to production', PriorityEnum.high, StatusEnum.pending),
    ('Update README', PriorityEnum.low, StatusEnum.completed),
    ('Fix login bug', PriorityEnum.high, StatusEnum.completed),
]):
    db.add(Task(user_id=u.id, title=title, priority=pri, status=sta))
db.commit()
print('Seed data created. Login: demo@taskflow.io / demo1234')
"
```
