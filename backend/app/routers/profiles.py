from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import UserUpdate, UserResponse
from ..auth import get_current_user, get_password_hash

router = APIRouter(prefix="/api/profile", tags=["profiles"])

@router.get("", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("", response_model=UserResponse)
def update_profile(
    profile_data: UserUpdate, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    if profile_data.name is not None:
        current_user.name = profile_data.name
    if profile_data.bio is not None:
        current_user.bio = profile_data.bio
    if profile_data.skills is not None:
        current_user.skills = profile_data.skills
    if profile_data.resume_url is not None:
        current_user.resume_url = profile_data.resume_url
    if profile_data.password is not None:
        if len(profile_data.password) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 6 characters long"
            )
        current_user.password_hash = get_password_hash(profile_data.password)
        
    db.commit()
    db.refresh(current_user)
    return current_user
