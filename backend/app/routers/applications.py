from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Application, Job, User
from ..schemas import ApplicationCreate, ApplicationResponse, ApplicationDetailedResponse, ApplicationStatusUpdate
from ..auth import get_current_user, get_current_student, get_current_hiring_manager

router = APIRouter(prefix="/api/applications", tags=["applications"])

@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def apply_to_job(
    app_data: ApplicationCreate,
    job_id: int,
    current_user: User = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id, Job.is_active == True).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Active job listing not found"
        )
        
    # Check if student already applied to this job
    existing_app = db.query(Application).filter(
        Application.job_id == job_id,
        Application.student_id == current_user.id
    ).first()
    
    if existing_app:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already applied to this job"
        )
        
    # Use provided resume_url or fall back to profile resume_url
    resume_url = app_data.resume_url or current_user.resume_url
    
    db_app = Application(
        job_id=job_id,
        student_id=current_user.id,
        resume_url=resume_url,
        cover_letter=app_data.cover_letter,
        status="applied"
    )
    db.add(db_app)
    db.commit()
    db.refresh(db_app)
    return db_app

@router.get("", response_model=List[ApplicationDetailedResponse])
def get_application_history(
    current_user: User = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    # Fetch student's applications with detailed job and user details
    return db.query(Application).filter(Application.student_id == current_user.id).order_by(Application.applied_at.desc()).all()

@router.put("/{app_id}/status", response_model=ApplicationDetailedResponse)
def update_application_status(
    app_id: int,
    status_data: ApplicationStatusUpdate,
    current_user: User = Depends(get_current_hiring_manager),
    db: Session = Depends(get_db)
):
    # Find application
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
        
    # Check if the current hiring manager posted the job
    if app.job.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only manage application statuses for job listings you posted."
        )
        
    new_status = status_data.status.lower()
    if new_status not in ["applied", "reviewing", "accepted", "rejected"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status. Allowed values: applied, reviewing, accepted, rejected"
        )
        
    app.status = new_status
    db.commit()
    db.refresh(app)
    return app
