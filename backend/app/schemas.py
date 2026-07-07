from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
import datetime

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    name: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
    user_id: Optional[int] = None


# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    role: str = Field(..., description="Role must be 'student' or 'hiring_manager'")
    name: str

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[str] = None
    resume_url: Optional[str] = None
    password: Optional[str] = None

class UserResponse(UserBase):
    id: int
    bio: Optional[str] = None
    skills: Optional[str] = None
    resume_url: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True


# --- Job Schemas ---
class JobBase(BaseModel):
    title: str
    company: str
    description: str
    requirements: Optional[str] = None
    location: str
    salary_range: Optional[str] = None
    is_active: bool = True
    source: str = "internal"
    application_url: Optional[str] = None

class JobCreate(BaseModel):
    title: str
    company: str
    description: str
    requirements: Optional[str] = None
    location: str
    salary_range: Optional[str] = None

class JobUpdate(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    location: Optional[str] = None
    salary_range: Optional[str] = None
    is_active: Optional[bool] = None

class JobResponse(JobBase):
    id: int
    created_by: Optional[int] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True


# --- Application Schemas ---
class ApplicationBase(BaseModel):
    job_id: int
    resume_url: Optional[str] = None
    cover_letter: Optional[str] = None

class ApplicationCreate(BaseModel):
    cover_letter: Optional[str] = None
    resume_url: Optional[str] = None

class ApplicationStatusUpdate(BaseModel):
    status: str = Field(..., description="Must be 'applied', 'reviewing', 'accepted', or 'rejected'")

class ApplicationResponse(ApplicationBase):
    id: int
    student_id: int
    status: str
    applied_at: datetime.datetime

    class Config:
        from_attributes = True

class ApplicationDetailedResponse(BaseModel):
    id: int
    status: str
    applied_at: datetime.datetime
    cover_letter: Optional[str] = None
    resume_url: Optional[str] = None
    job: JobResponse
    student: UserResponse

    class Config:
        from_attributes = True


# --- Scraper Schema ---
class ScrapeRequest(BaseModel):
    url: Optional[str] = None
    search_query: Optional[str] = None
