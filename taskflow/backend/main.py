# main.py
# FastAPI application ka main entry point - yahan se sab shuru hota hai

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

# Apne modules import karo
from database import engine, Base, get_db
import models
import schemas
from auth import get_current_user, hash_password
from routers import auth, projects, tasks

# ─────────────────────────────────────────
#  App Initialize
# ─────────────────────────────────────────

# FastAPI app banao with metadata (ye Swagger docs mein dikhega)
app = FastAPI(
    title="TaskFlow API",
    description="A project and task management system built with FastAPI",
    version="1.0.0"
)

# ─────────────────────────────────────────
#  CORS Middleware
# ─────────────────────────────────────────
# CORS (Cross-Origin Resource Sharing): React frontend (port 3000) ko
# FastAPI backend (port 8000) se data lene ki permission deta hai
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev server ports
    allow_credentials=True,
    allow_methods=["*"],    # GET, POST, PUT, DELETE sab allow
    allow_headers=["*"],    # Authorization header bhi allow
)

# ─────────────────────────────────────────
#  Database Tables Create
# ─────────────────────────────────────────
# App start hone par agar tables nahi hain toh automatically ban jayenge
Base.metadata.create_all(bind=engine)


# ─────────────────────────────────────────
#  Routers Register
# ─────────────────────────────────────────
# Alag-alag router files ke endpoints main app mein add karo
app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(tasks.router)


# ─────────────────────────────────────────
#  Extra Routes
# ─────────────────────────────────────────

@app.get("/")
def root():
    """Health check endpoint - API chal rahi hai ya nahi check karo"""
    return {"message": "TaskFlow API is running!", "version": "1.0.0"}


@app.get("/dashboard/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Dashboard ke liye overall statistics.
    - Total projects, total tasks
    - Tasks by status count
    - High priority tasks count
    """
    total_projects = db.query(models.Project).filter(
        models.Project.is_active == True
    ).count()

    total_tasks = db.query(models.Task).count()

    todo_tasks = db.query(models.Task).filter(
        models.Task.status == models.StatusEnum.todo
    ).count()

    in_progress_tasks = db.query(models.Task).filter(
        models.Task.status == models.StatusEnum.in_progress
    ).count()

    done_tasks = db.query(models.Task).filter(
        models.Task.status == models.StatusEnum.done
    ).count()

    high_priority_tasks = db.query(models.Task).filter(
        models.Task.priority == models.PriorityEnum.high
    ).count()

    return {
        "total_projects": total_projects,
        "total_tasks": total_tasks,
        "todo_tasks": todo_tasks,
        "in_progress_tasks": in_progress_tasks,
        "done_tasks": done_tasks,
        "high_priority_tasks": high_priority_tasks
    }


@app.get("/users/", response_model=list[schemas.UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Saare users ki list - task assign karne ke liye"""
    return db.query(models.User).filter(models.User.is_active == True).all()


# ─────────────────────────────────────────
#  Run the app (development)
# ─────────────────────────────────────────
# Command: uvicorn main:app --reload
# --reload: code change hone par automatically restart hoga
