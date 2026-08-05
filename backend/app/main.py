from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings
from app.api.routes import auth, tasks, analytics, feedback
from app.core.database import Base, engine, get_db
from sqlalchemy.orm import Session
from sqlalchemy import text

# Create tables
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    import logging
    logging.error(f"Failed to create database tables on startup: {e}")

app = FastAPI(
    title="TaskFlow API",
    description="Full Stack Task Management System with Analytics",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(tasks.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(feedback.router, prefix="/api")

@app.get("/api/health", tags=["Health"])
def health(db: Session = Depends(get_db)):
    db_status = "ok"
    db_error = None
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = "failed"
        db_error = str(e)
    
    db_url = settings.DATABASE_URL
    masked_url = "unknown"
    try:
        from urllib.parse import urlparse
        parsed = urlparse(db_url)
        masked_url = f"{parsed.scheme}://{parsed.hostname or 'unknown'}/{parsed.path.lstrip('/')}"
    except Exception:
        pass

    return {
        "status": "ok" if db_status == "ok" else "error",
        "service": "TaskFlow API",
        "database": {
            "status": db_status,
            "url": masked_url,
            "error": db_error
        }
    }
