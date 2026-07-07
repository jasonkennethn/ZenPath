import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from .database import engine, Base
from .routers import auth, profiles, jobs, applications

# Load env variables from backend/.env
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))

# Auto-create tables on startup (if not already existing)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Job Scraper & Matching API",
    description="Backend service for role-based job posting, applications tracking, and Gemini-powered scraping.",
    version="1.0.0"
)

# CORS Middleware configuration - production level settings supporting credentials
frontend_url = os.getenv("FRONTEND_URL", "https://zenpath-frontend.vercel.app")
origins = [
    frontend_url,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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
