# LLM Chat & Admin

A production-minded ChatGPT-like application with a React frontend and FastAPI backend.

## Features

- **User**: Real-time chat, conversation history, file attachment (RAG context), model configuration.
- **Admin**: Dashboard with usage metrics, user management, and model controls.
- **Tech**: React (Vite/TS), FastAPI, SQLite/Postgres, Docker, Tailwind CSS.

## Quick Start (Local Docker)

1. Create a `.env` file in the root directory (see `.env.example`).
2. Run `docker-compose up --build`.
3. Open `http://localhost:5173` for the frontend.
4. Open `http://localhost:8000/docs` for the backend API swagger.



## Manual Setup

### Backend
1. `cd backend`
2. `python -m venv venv`
3. `source venv/bin/activate` (or `venv\Scripts\activate` on Windows)
4. `pip install -r requirements.txt`
5. `uvicorn app.main:app --reload`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Default Credentials
- **Admin**: Create via API or Register via UI, then manually update database `is_admin=true` (or use the seed script provided in `main.py` startup event if added).
- *Note*: The system allows registration. To make an admin, register a user, then access the DB: `UPDATE users SET is_admin=1 WHERE email='your@email.com';`

## Environment Variables (.env)
```
DATABASE_URL=sqlite:///./sql_app.db
SECRET_KEY=change_this_secret_in_prod
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
HF_API_TOKEN=your_hugging_face_token
```

## Architecture
- **Frontend**: React 18, Zustand (Store), Recharts (Metrics), Axios.
- **Backend**: FastAPI, SQLAlchemy (ORM), Pydantic (Validation), Python-Jose (JWT).
