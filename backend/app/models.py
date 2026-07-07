import datetime
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)  # "student" or "hiring_manager"
    name = Column(String, nullable=False)
    bio = Column(Text, nullable=True)
    skills = Column(Text, nullable=True)  # Comma separated or text
    resume_url = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    jobs_posted = relationship("Job", back_populates="posted_by", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="student", cascade="all, delete-orphan")


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    company = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=False)
    requirements = Column(Text, nullable=True)  # HTML or bullet list
    location = Column(String, nullable=False)
    salary_range = Column(String, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    is_active = Column(Boolean, default=True)
    source = Column(String, default="internal")  # "internal" or name of scraped platform
    application_url = Column(Text, nullable=True)  # URL for scraped jobs
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    posted_by = relationship("User", back_populates="jobs_posted")
    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    resume_url = Column(Text, nullable=True)
    cover_letter = Column(Text, nullable=True)
    status = Column(String, default="applied")  # "applied", "reviewing", "accepted", "rejected"
    applied_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    job = relationship("Job", back_populates="applications")
    student = relationship("User", back_populates="applications")
