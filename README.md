# ZenPath 🎓💼

ZenPath is a modern, high-performance job board and intelligent recruitment platform designed to connect student applicants with hiring managers. 

Built with **Next.js (React + TypeScript)** on the frontend and **FastAPI (Python)** on the backend, the platform features role-based access control, real-time application pipelines, responsive glassmorphic layouts, and an AI-powered job parser driven by **Google Gemini 1.5 Flash**.

---

## 🌟 Key Features

* **AI Web Scraper:** Crawl and structure job listings from any public career site or search query using Google Gemini 1.5 Flash.
* **Student Workspace:** Search listings, submit applications, upload resumes, and track submission progress in real-time.
* **Hiring Manager Board:** Post new positions, manage active listings, and progress applicants through hiring stages.
* **Modern Premium UI:** Auto-adapting light/dark mode, smooth responsive mobile navigation drawer, and pulsing skeleton loader screens (<0.05s).

---

## 🛠️ Technology Stack

* **Frontend:** Next.js 15+, React 19, TypeScript, Vanilla CSS + Tailwind CSS v4.
* **Backend:** FastAPI (Python 3.9+), SQLAlchemy ORM, Uvicorn ASGI Server.
* **Database:** Hosted Serverless PostgreSQL via Neon.
* **AI Model:** Google Gemini 1.5 Flash API.

---

## 🚀 Quickstart Guide

### 1. Database Setup
Create a PostgreSQL database instance (e.g., via [Neon](https://neon.tech)) and obtain your connection URL.

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
4. Create a `.env` file based on `.env.example` and populate:
   * `DATABASE_URL` (PostgreSQL Connection String)
   * `JWT_SECRET` (Secure JWT signing key)
   * `GEMINI_API_KEY` (Google Gemini API Key)
   * `FRONTEND_URL` (Allowed CORS Origin)
5. Run the server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### 3. Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file containing:
   * `NEXT_PUBLIC_BACKEND_URL` (Backend API URL)
4. Start the Next.js development server:
   ```bash
   npm run dev
   ```

---

## ☁️ Deployment

ZenPath is fully deployable to **Vercel**:
* **Frontend:** Deploy Next.js directly by linking your repository and setting the root directory to `frontend`. Configure your `NEXT_PUBLIC_BACKEND_URL` environment variable.
* **Backend:** Deploy the FastAPI server by setting the root directory to `backend`. Vercel will automatically read `vercel.json` and deploy it using the `@vercel/python` runtime. Configure your database, JWT, and Gemini environment keys.
