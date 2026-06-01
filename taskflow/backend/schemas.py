# schemas.py
# Pydantic schemas - ye define karte hain ki API ko kya data milega aur kya return karega
# Models (database) aur Schemas (API) ko alag rakhna best practice hai

from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from models import PriorityEnum, StatusEnum


# ─────────────────────────────────────────
#  USER SCHEMAS
# ─────────────────────────────────────────

class UserCreate(BaseModel):
    """User registration ke liye input schema"""
    name: str
    email: EmailStr          # EmailStr automatically valid email check karta hai
    password: str
    role: Optional[str] = "member"


class UserLogin(BaseModel):
    """Login ke liye input schema"""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """API response mein user ka data - password kabhi mat bhejo!"""
    id: int
    name: str
    email: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True  # SQLAlchemy model se directly data le sakta hai


class Token(BaseModel):
    """Login hone ke baad JWT token return hoga"""
    access_token: str
    token_type: str
    user: UserResponse


# ─────────────────────────────────────────
#  PROJECT SCHEMAS
# ─────────────────────────────────────────

class ProjectCreate(BaseModel):
    """Naya project banane ke liye"""
    name: str
    description: Optional[str] = None


class ProjectUpdate(BaseModel):
    """Project update ke liye - sab fields optional hain"""
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class ProjectResponse(BaseModel):
    """Project ka API response"""
    id: int
    name: str
    description: Optional[str]
    is_active: bool
    owner_id: int
    created_at: datetime
    task_count: Optional[int] = 0  # kitne tasks hain is project mein

    class Config:
        from_attributes = True


# ─────────────────────────────────────────
#  TASK SCHEMAS
# ─────────────────────────────────────────

class TaskCreate(BaseModel):
    """Naya task banane ke liye"""
    title: str
    description: Optional[str] = None
    status: Optional[StatusEnum] = StatusEnum.todo
    priority: Optional[PriorityEnum] = PriorityEnum.medium
    due_date: Optional[str] = None       # "YYYY-MM-DD" format
    project_id: int
    assigned_to: Optional[int] = None   # User ID jisko assign karna hai


class TaskUpdate(BaseModel):
    """Task update ke liye - sab fields optional"""
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[StatusEnum] = None
    priority: Optional[PriorityEnum] = None
    due_date: Optional[str] = None
    assigned_to: Optional[int] = None


class TaskResponse(BaseModel):
    """Task ka API response"""
    id: int
    title: str
    description: Optional[str]
    status: StatusEnum
    priority: PriorityEnum
    due_date: Optional[str]
    project_id: int
    assigned_to: Optional[int]
    assigned_to_name: Optional[str] = None  # assigned user ka naam
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class DashboardStats(BaseModel):
    """Dashboard ke liye stats"""
    total_projects: int
    total_tasks: int
    todo_tasks: int
    in_progress_tasks: int
    done_tasks: int
    high_priority_tasks: int
