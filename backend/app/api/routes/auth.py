from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.auth_service import AuthService
from app.schemas.user import UserCreate, UserLogin, Token, TokenRefresh

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register(data: UserCreate, db: Session = Depends(get_db)):
    return AuthService(db).register(data)

@router.post("/login", response_model=Token)
def login(data: UserLogin, db: Session = Depends(get_db)):
    return AuthService(db).login(data)

@router.post("/refresh", response_model=Token)
def refresh(data: TokenRefresh, db: Session = Depends(get_db)):
    return AuthService(db).refresh(data.refresh_token)
