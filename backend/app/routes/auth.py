from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse, UserSummary
from app.auth.security import verify_password, create_access_token
from app.auth.dependencies import get_current_user
from app.services.audit_service import log_audit

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
def login(request: Request, payload: LoginRequest, db: Session = Depends(get_db)):
    # Support login with either username or email
    user = db.query(User).filter(
        (User.username == payload.username_or_email) | (User.email == payload.username_or_email)
    ).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is deactivated"
        )

    token = create_access_token(subject=user.id, role=user.role)

    # Log login action
    client_ip = request.client.host if request.client else None
    log_audit(
        db=db,
        action="USER_LOGIN",
        entity_type="auth",
        entity_id=str(user.id),
        user=user,
        details={"username": user.username, "role": user.role},
        ip_address=client_ip
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }


@router.get("/me", response_model=UserSummary)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user
