# Student Management System

A production-ready Student Management System built with **React (Vite)** on the frontend and **FastAPI** on the backend. This application features secure JWT authentication, PostgreSQL database integration (Supabase), secure SMTP email capabilities via Brevo HTTP API, responsive modern UI, and automated Alembic migrations.

## Tech Stack
- **Frontend**: React, Vite, Axios, TailwindCSS / Vanilla CSS, React Router
- **Backend**: FastAPI, SQLAlchemy, Pydantic, Uvicorn
- **Database**: PostgreSQL (Supabase)
- **Deployment Targets**: Vercel (Frontend), Render (Backend)

---

## 🚀 Local Development Setup

### 1. Database Setup (Supabase)
1. Create a new project on [Supabase](https://supabase.com/).
2. Navigate to **Project Settings -> Database** and copy the Connection String (URI).
3. Ensure you append `?sslmode=require` if necessary.

### 2. Email Setup (Brevo)
1. Create an account on [Brevo](https://www.brevo.com/).
2. Generate an API Key under **SMTP & API**.

### 3. Backend Setup
```bash
cd backend
python -m venv venv

# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

**Environment Variables**
Create a `.env` file in the `backend/` directory using the provided `.env.example`:
```ini
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres
JWT_SECRET_KEY=your_super_secret_key
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60
FRONTEND_URL=http://localhost:5173
EMAIL_API_KEY=xkeysib-your_brevo_api_key_here
EMAIL_FROM=noreply@yourdomain.com
EMAIL_API_URL=https://api.brevo.com/v3/smtp/email
```

**Database Migrations (Alembic)**
Run migrations to set up your tables:
```bash
alembic upgrade head
```

**Start the Backend Server**
```bash
uvicorn main:app --reload
```
The API will be available at `http://127.0.0.1:8000`.

### 4. Frontend Setup
```bash
cd frontend
npm install
```

**Environment Variables**
Create a `.env` file in the `frontend/` directory:
```ini
VITE_API_URL=http://127.0.0.1:8000
```

**Start the Frontend Server**
```bash
npm run dev
```
The frontend will be available at `http://localhost:5173`.

---

## 🛠️ Testing & Verification
### Run Automated Tests
```bash
cd backend
pytest
```
### Verify Frontend Build
```bash
cd frontend
npm run build
```

---

## ☁️ Deployment Instructions

### 1. Deploying the Backend (Render)
1. Go to [Render](https://render.com/) and create a new **Web Service**.
2. Connect your GitHub repository.
3. Configure the service:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt && alembic upgrade head`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add all environment variables from your `.env` file into Render's Environment Variables section.

### 2. Deploying the Frontend (Vercel)
1. Go to [Vercel](https://vercel.com/) and import your GitHub repository.
2. Configure the project:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variable:
   - `VITE_API_URL`: `https://your-render-backend-url.onrender.com`
4. The SPA routing is automatically handled by the `vercel.json` included in the root of the frontend folder.

---

## 🛑 Troubleshooting
- **Database Connection Errors**: Ensure your Supabase `DATABASE_URL` is correct and contains the password. Check your IP whitelisting in Supabase settings.
- **Emails Not Sending**: Ensure your `EMAIL_API_KEY` is correct. Brevo may require you to verify your sender domain or email address.
- **CORS Errors**: Ensure the `FRONTEND_URL` environment variable on the backend perfectly matches the deployed Vercel URL without a trailing slash (e.g., `https://my-app.vercel.app`).
- **401/403 Errors on Login**: Verify `JWT_SECRET_KEY` matches exactly on your production environment and that the user's role is correctly set in the database.
