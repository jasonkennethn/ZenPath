import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import auth, profiles, jobs, applications

# Auto-create tables on startup (if not already existing)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Job Scraper & Matching API",
    description="Backend service for role-based job posting, applications tracking, and Gemini-powered scraping.",
    version="1.0.0"
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for dev sandbox environment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(profiles.router)
app.include_router(jobs.router)
app.include_router(applications.router)

@app.get("/")
def read_root():
    return {
        "status": "healthy",
        "message": "Job Scraper Platform API is running.",
        "docs_url": "/docs"
    }
