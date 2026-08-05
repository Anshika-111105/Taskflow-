from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories.user_repository import UserRepository
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token, decode_token, create_reset_token
from app.schemas.user import UserCreate, UserLogin, Token, UserOut

class AuthService:
    def __init__(self, db: Session):
        self.repo = UserRepository(db)

    def register(self, data: UserCreate) -> Token:
        if self.repo.get_by_email(data.email):
            raise HTTPException(status_code=400, detail="Email already registered")
        hashed = get_password_hash(data.password)
        user = self.repo.create(data.name, data.email, hashed)
        return self._create_tokens(user)

    def login(self, data: UserLogin) -> Token:
        user = self.repo.get_by_email(data.email)
        if not user or not verify_password(data.password, user.password):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        return self._create_tokens(user)

    def refresh(self, refresh_token: str) -> Token:
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid refresh token")
        user = self.repo.get_by_id(int(payload.get("sub")))
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return self._create_tokens(user)

    def _create_tokens(self, user) -> Token:
        access = create_access_token({"sub": str(user.id)})
        refresh = create_refresh_token({"sub": str(user.id)})
        return Token(
            access_token=access,
            refresh_token=refresh,
            user=UserOut.model_validate(user)
        )

    def forgot_password(self, email: str) -> dict:
        user = self.repo.get_by_email(email)
        if not user:
            # Mask to prevent email enumeration, but return a success message.
            return {"message": "If the email is registered, you will receive a reset link.", "debug_token": None}
        
        reset_token = create_reset_token({"sub": str(user.id)})
        # Console output for local/debug visibility
        print(f"\n--- PASSWORD RESET LINK FOR {email} ---\nhttp://localhost:5173/reset-password?token={reset_token}\n---------------------------------------\n")
        return {
            "message": "If the email is registered, you will receive a reset link.",
            "debug_token": reset_token  # Expose in API response for developer UI shortcut testing
        }

    def reset_password(self, token: str, new_password: str) -> dict:
        payload = decode_token(token)
        if not payload or payload.get("type") != "reset":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset token")
        
        user_id = payload.get("sub")
        user = self.repo.get_by_id(int(user_id))
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
        user.password = get_password_hash(new_password)
        self.db.add(user)
        self.db.commit()
        return {"message": "Password reset successful"}

