from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from ..database import get_db
from ..models import Job, User, Application
from ..schemas import JobCreate, JobUpdate, JobResponse, ScrapeRequest, ApplicationDetailedResponse
from ..auth import get_current_user, get_current_hiring_manager, get_current_student
from ..scraper import fetch_url_content, query_gemini_for_jobs

router = APIRouter(prefix="/api/jobs", tags=["jobs"])

@router.get("", response_model=List[JobResponse])
def get_jobs(
    q: Optional[str] = None,
    location: Optional[str] = None,
    source: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Job).filter(Job.is_active == True)
    
    if q:
        query = query.filter(
            or_(
                Job.title.ilike(f"%{q}%"),
                Job.company.ilike(f"%{q}%"),
                Job.description.ilike(f"%{q}%")
            )
        )
    if location:
        query = query.filter(Job.location.ilike(f"%{location}%"))
    if source:
        if source.lower() == "internal":
            query = query.filter(Job.source == "internal")
        elif source.lower() == "external":
            query = query.filter(Job.source != "internal")
        else:
            query = query.filter(Job.source.ilike(f"%{source}%"))
            
    # Return newest jobs first
    return query.order_by(Job.created_at.desc()).all()

@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(
    job_data: JobCreate,
    current_user: User = Depends(get_current_hiring_manager),
    db: Session = Depends(get_db)
):
    db_job = Job(
        title=job_data.title,
        company=job_data.company,
        description=job_data.description,
        requirements=job_data.requirements,
        location=job_data.location,
        salary_range=job_data.salary_range,
        created_by=current_user.id,
        source="internal"
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

@router.put("/{job_id}", response_model=JobResponse)
def update_job(
    job_id: int,
    job_data: JobUpdate,
    current_user: User = Depends(get_current_hiring_manager),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id, Job.created_by == current_user.id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job posting not found or unauthorized to edit"
        )
        
    if job_data.title is not None:
        job.title = job_data.title
    if job_data.company is not None:
        job.company = job_data.company
    if job_data.description is not None:
        job.description = job_data.description
    if job_data.requirements is not None:
        job.requirements = job_data.requirements
    if job_data.location is not None:
        job.location = job_data.location
    if job_data.salary_range is not None:
        job.salary_range = job_data.salary_range
    if job_data.is_active is not None:
        job.is_active = job_data.is_active
        
    db.commit()
    db.refresh(job)
    return job

@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(
    job_id: int,
    current_user: User = Depends(get_current_hiring_manager),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id, Job.created_by == current_user.id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job posting not found or unauthorized to delete"
        )
    db.delete(job)
    db.commit()
    return None

@router.get("/{job_id}/applicants", response_model=List[ApplicationDetailedResponse])
def get_job_applicants(
    job_id: int,
    current_user: User = Depends(get_current_hiring_manager),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id, Job.created_by == current_user.id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job posting not found or unauthorized"
        )
    
    # Return all applications for this job
    return db.query(Application).filter(Application.job_id == job_id).all()

@router.post("/scrape", response_model=List[JobResponse])
async def scrape_jobs(
    scrape_req: ScrapeRequest,
    current_user: User = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    if not scrape_req.url and not scrape_req.search_query:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either a URL or a search query must be provided."
        )
        
    scraped_jobs_data = []
    
    if scrape_req.url:
        try:
            content = await fetch_url_content(scrape_req.url)
            scraped_jobs_data = query_gemini_for_jobs(content, is_search=False)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to fetch or parse URL content: {str(e)}"
            )
    else:
        # Search query matching - generated/scraped via Gemini
        scraped_jobs_data = query_gemini_for_jobs(scrape_req.search_query, is_search=True)
        
    saved_jobs = []
    for job_data in scraped_jobs_data:
        # Avoid duplicate postings by comparing title, company, location and source
        title = job_data.get("title", "").strip()
        company = job_data.get("company", "").strip()
        location = job_data.get("location", "").strip()
        source = job_data.get("source", "scraped").strip()
        
        if not title or not company:
            continue
            
        existing_job = db.query(Job).filter(
            Job.title.ilike(title),
            Job.company.ilike(company),
            Job.location.ilike(location),
            Job.source == source
        ).first()
        
        if existing_job:
            saved_jobs.append(existing_job)
        else:
            db_job = Job(
                title=title,
                company=company,
                description=job_data.get("description", "No description provided."),
                requirements=job_data.get("requirements", ""),
                location=location or "Remote",
                salary_range=job_data.get("salary_range", "Not Specified"),
                source=source,
                application_url=job_data.get("application_url", ""),
                is_active=True
            )
            db.add(db_job)
            db.commit()
            db.refresh(db_job)
            saved_jobs.append(db_job)
            
    return saved_jobs
