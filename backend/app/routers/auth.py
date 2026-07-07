from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import UserCreate, UserResponse, Token
from ..auth import verify_password, get_password_hash, create_access_token
import datetime

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    if user_data.role not in ["student", "hiring_manager"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role must be 'student' or 'hiring_manager'"
        )

    # Create user
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        password_hash=hashed_password,
        role=user_data.role,
        name=user_data.name
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Generate token
    access_token = create_access_token(
        data={"sub": db_user.email, "role": db_user.role, "user_id": db_user.id}
    )
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "role": db_user.role,
        "name": db_user.name
    }

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role, "user_id": user.id}
    )
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "role": user.role,
        "name": user.name
    }
