# ZenPath 🎓💼

ZenPath is a premium, high-performance job board and intelligent web scraping platform designed to bridge the gap between student applicants and hiring managers. 

Built with **Next.js (React + TypeScript)** on the frontend and **FastAPI (Python)** on the backend, the platform features role-based access control, real-time application status tracking, responsive glassmorphic interfaces, and an AI-powered job parser driven by the **Google Gemini 1.5 Flash Model**.

---

## 🌟 Core Features

### 👤 Role-Based Access Control
* **Student Portal:**
  * Explore and search from database listings or external jobs.
  * Run the **Gemini AI Intelligent Web Scraper** using any raw URL or query.
  * Apply directly to postings, submit cover letters, and link resumes.
  * Check submission progress in real time via the **Applications Timeline**.
  * Edit and maintain a professional profile (bio, portfolio link, and real-time skills badges).
* **Hiring Manager Portal:**
  * Post new positions, modify active details, or close listings.
  * View real-time statistics (active openings and incoming candidates).
  * Check candidate summaries, biographies, skills, and resumes.
  * Manage hiring pipelines by progressing application stages (`Applied`, `Reviewing`, `Accepted`, `Rejected`).

### 🤖 Gemini AI Scraper
* Paste any career site URL (e.g., `stripe.com/careers`) or enter an AI search query.
* Backend calls Gemini 1.5 Flash to automatically parse and return structured jobs (Title, Company, Location, Description, Requirements, and Application URL) and save them to PostgreSQL.

### 🎨 Apple-Smooth Aesthetics
* High-performance glassmorphism design system.
* Fast, pulsing skeleton loader screens (<0.05s response simulated) instead of jarring spinners.
* Non-blocking Toast notification banners.
* Native system dark/light mode detection that auto-adapts on first visit and persists choices in `localStorage`.

---

## 🛠️ Technology Stack

* **Frontend:** Next.js 15+ (App Router), React 19, TypeScript, Vanilla CSS + Tailwind CSS v4, Lucide React (Icons).
* **Backend:** FastAPI, Python 3.9+, SQLAlchemy ORM, Uvicorn (ASGI server).
* **Database:** Neon Serverless PostgreSQL (Hosted database).
* **AI Model:** Google Gemini 1.5 Flash API.

---

## 📁 Directory Structure

```
ASSIGNMENT/
├── backend/                  # FastAPI Backend Service
│   ├── app/
│   │   ├── routers/          # API endpoints (auth, jobs, profiles, etc.)
│   │   ├── database.py       # SQLAlchemy setup & connection pooling
│   │   ├── main.py           # FastAPI server initialization & CORS
│   │   ├── models.py         # SQLAlchemy Database Schemas
│   │   ├── schemas.py        # Pydantic Request/Response validation
│   │   └── scraper.py        # Gemini AI Scraper Integration
│   ├── requirements.txt      # Python dependencies
│   ├── .env                  # Environment secrets (ignored by git)
│   └── .env.example          # Environment template
│
├── frontend/                 # Next.js Frontend Application
│   ├── src/
│   │   ├── app/              # Next.js Pages & Router layouts
│   │   ├── context/          # Auth, Theme, & API contexts
│   │   └── globals.css       # Core design styles & glassmorphic tokens
│   ├── public/               # Asset files (Logo, Icons)
│   ├── package.json          # Node dependencies
│   └── tsconfig.json         # TypeScript configuration
│
└── README.md                 # Primary Documentation
```

---

## 🚀 Setup & Installation

### 1. Database Configuration
Ensure you have a PostgreSQL instance running. We recommend [Neon PostgreSQL](https://neon.tech) for serverless scalability.
Generate a connection URL with SSL enabled, e.g.:
`postgresql://user:password@host-pooler.region.neon.tech/dbname?sslmode=require`

### 2. Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv env
   source env/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
5. Populate variables inside `.env`:
   * `DATABASE_URL`: Your PostgreSQL connection string.
   * `JWT_SECRET`: A secure key for encoding JWT authentication tokens.
   * `GEMINI_API_KEY`: Your Google Gemini API Key.

6. Launch the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   * The API documentation will be available at `https://zenpath-backend.vercel.app/docs`.

### 3. Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd ../frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Launch the Next.js development server:
   ```bash
   npm run dev
   ```
   * Open `https://zenpath-frontend.vercel.app` to access the application.

---

## 🔒 Production Readiness Checklist
* [x] CORS origins configured cleanly inside backend `main.py`.
* [x] Neon Connection pooling enabled (`pool_size=5`, `max_overflow=10`).
* [x] Secrets completely ignored via root `.gitignore`.
* [x] Dynamic production-ready Next.js layout building correctly with Turbopack.
