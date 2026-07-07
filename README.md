# ZenPath 🎓💼

> **ZenPath** is an enterprise-grade, AI-powered career matching and recruitment workflow platform. It enables students to discover, scrape, and track job opportunities, while giving hiring managers a complete Applicant Tracking System (ATS) to post positions, review candidates, and manage hiring pipelines.

ZenPath is built using a modern, decoupled architecture: **Next.js (React + TypeScript)** on the frontend, **FastAPI (Python)** on the backend, and **Neon Serverless PostgreSQL** for data persistence. The platform features an intelligent, LLM-driven job extraction engine powered by the **Google Gemini 1.5 Flash Model** to turn any career portal URL or search query into structured database listings instantly.

---

## 🌟 Core Product Capabilities

### 1. AI-Driven Job Extraction (Gemini Scraper)
* **Web Scraping Engine:** Crawl and extract job details from any public career site (e.g., `stripe.com/careers`) or company board.
* **Intelligent Querying:** Type natural language search queries (e.g., *"React developer remote"*). The extraction engine parses web resources and structures them into unified schema formats.
* **LLM Parsing:** Integrates Google Gemini 1.5 Flash to dynamically clean raw HTML/text, extracting titles, locations, companies, salary ranges, full descriptions, and requirements in structured JSON format.

### 2. Candidate (Student) Experience
* **Centralized Search Board:** Explore both internal postings (submitted directly by hiring managers) and external listings (scraped via AI).
* **Unified Pipeline Tracker:** View complete application histories in a visual timeline from submission to final decision.
* **Live Profile & CV Manager:** Update professional bios, portfolio links, and resume document paths. Skills inputs automatically generate responsive interactive tags on candidate summaries.

### 3. Employer (Hiring Manager) Workspace
* **Postings Manager:** Publish, edit, and close listings through a clean interface with immediate database updates.
* **Applicant Tracking System (ATS):** Access candidate details including resumes, cover letters, skills, and histories.
* **Pipeline Status Lifecycle:** Push applicants through stages (`Applied` ➡️ `Reviewing` ➡️ `Accepted` or `Rejected`) with instant visual feedback.

### 4. Apple-Smooth Design & UX
* **Glassmorphism Theme System:** Sleek, premium styling using backdrop filters, custom scrollbars, and glowing overlays.
* **Fast Skeleton Loading:** Smooth, pulsing placeholders load in **<0.05 seconds**, ensuring a fluid user experience.
* **Non-Blocking Toast System:** In-page status alerts that do not block the browser thread.
* **Auto-Adaptive Themes:** Detects and applies system preferences (Dark/Light mode) on first load, caching overrides in `localStorage`.
* **Mobile-Responsive Layout:** Sticky navigation headers and a sliding hamburger menu drawer on mobile.

---

## ⚙️ Architecture & Technical Stack

```
                     ┌───────────────────────────────┐
                     │     Next.js Client (SPA)      │
                     │  (Vercel: zenpath-frontend)   │
                     └───────────────┬───────────────┘
                                     │ HTTPS / JWT
                                     ▼
                     ┌───────────────────────────────┐
                     │    FastAPI Gateway Server     │
                     │   (Vercel: zenpath-backend)   │
                     └───────┬───────────────┬───────┘
                             │               │
                             ▼               ▼
            ┌──────────────────┐   ┌───────────────────┐
            │  Serverless PG   │   │  Google Gemini    │
            │  (Neon Database) │   │   1.5 Flash API   │
            └──────────────────┘   └───────────────────┘
```

### 💻 Frontend Client
* **Framework:** Next.js 15+ (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS v4 & Vanilla CSS
* **State Management:** React Context (Auth, Theme)
* **Icons:** Lucide React

### ⚙️ Backend API Server
* **Framework:** FastAPI (Python 3.9+)
* **Database Access:** SQLAlchemy ORM
* **Security:** JWT (JSON Web Tokens), `bcrypt` password hashing
* **Production Gateway:** Uvicorn ASGI Server & Vercel Python Runtime

### 🗄️ Database & Core Infrastructure
* **Relational Database:** Hosted Serverless PostgreSQL via Neon.
* **Connection Pooling:** Enabled connection reuse (`pool_size=5`, `max_overflow=10`, `pool_pre_ping=True`) to handle high-concurrency database queries.

---

## 🔒 Production Environment Configurations

ZenPath utilizes distinct environment variables for the frontend and backend. In production, these should be configured inside your Vercel Project dashboards.

### Backend Configurations (`backend/.env`)
Create a file named `.env` in the `backend/` folder:

```env
# PostgreSQL Connection URL (Neon pooler connection string)
DATABASE_URL=postgresql://user:password@host-pooler.region.neon.tech/dbname?sslmode=require

# JWT Token Settings
JWT_SECRET=your_secret_jwt_key_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Gemini AI Platform API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Production Frontend Allowed Origin (for CORS Validation)
FRONTEND_URL=https://zenpath-frontend.vercel.app
```

### Frontend Configurations (`frontend/.env`)
Create a file named `.env` in the `frontend/` folder:

```env
# Production Backend Target Endpoint
NEXT_PUBLIC_BACKEND_URL=https://zenpath-backend.vercel.app
```

---

## 🚀 Setup & Installation Guide

To run ZenPath locally, follow the steps below:

### 1. Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv env
   source env/bin/activate
   ```
3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Verify your `.env` contains the required keys.
5. Start the API server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### 2. Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd ../frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```

---

## 🌐 Vercel Deployment Guide

ZenPath is designed to deploy to Vercel as two separate projects:

### 1. Deploying the Frontend (`zenpath-frontend.vercel.app`)
1. Import your repository in Vercel.
2. Under **Project Settings**, set the **Root Directory** to `frontend`.
3. Vercel will automatically configure the **Next.js** build presets.
4. Add the `NEXT_PUBLIC_BACKEND_URL` environment variable.
5. Click **Deploy**.

### 2. Deploying the Backend (`zenpath-backend.vercel.app`)
1. Import your repository in Vercel.
2. Set the **Root Directory** to `backend`.
3. Vercel will automatically read the `vercel.json` configuration and deploy your FastAPI app using the `@vercel/python` runtime.
4. Add all environment variables listed in the Backend section (`DATABASE_URL`, `JWT_SECRET`, `JWT_ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `GEMINI_API_KEY`, and `FRONTEND_URL`).
5. Click **Deploy**.
