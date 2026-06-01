# routers/tasks.py
# Tasks ke CRUD endpoints + filter by status/priority

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

import models
import schemas
from auth import get_current_user
from database import get_db

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.post("/", response_model=schemas.TaskResponse, status_code=201)
def create_task(
    task_data: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Naya task banao. Project exist karna chahiye."""
    # Check: project exist karta hai?
    project = db.query(models.Project).filter(
        models.Project.id == task_data.project_id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    new_task = models.Task(
        title=task_data.title,
        description=task_data.description,
        status=task_data.status,
        priority=task_data.priority,
        due_date=task_data.due_date,
        project_id=task_data.project_id,
        assigned_to=task_data.assigned_to
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    # Assigned user ka naam fetch karo
    return _build_task_response(new_task, db)


@router.get("/", response_model=List[schemas.TaskResponse])
def get_tasks(
    project_id: Optional[int] = Query(None, description="Filter by project"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter: todo/in_progress/done"),
    priority_filter: Optional[str] = Query(None, alias="priority", description="Filter: low/medium/high"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Saare tasks lao. Optional filters:
    - project_id: specific project ke tasks
    - status: todo, in_progress, done
    - priority: low, medium, high
    """
    query = db.query(models.Task)

    if project_id:
        query = query.filter(models.Task.project_id == project_id)
    if status_filter:
        query = query.filter(models.Task.status == status_filter)
    if priority_filter:
        query = query.filter(models.Task.priority == priority_filter)

    tasks = query.order_by(models.Task.created_at.desc()).all()
    return [_build_task_response(t, db) for t in tasks]


@router.get("/{task_id}", response_model=schemas.TaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Ek specific task ki details"""
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return _build_task_response(task, db)


@router.put("/{task_id}", response_model=schemas.TaskResponse)
def update_task(
    task_id: int,
    task_data: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Task update karo - status, priority, assignment sab change kar sakte hain"""
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Sirf provided fields update karo
    update_data = task_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return _build_task_response(task, db)


@router.delete("/{task_id}", status_code=204)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Task delete karo"""
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()
    return None


# ─────────────────────────────────────────
#  Helper Function
# ─────────────────────────────────────────

def _build_task_response(task: models.Task, db: Session) -> schemas.TaskResponse:
    """
    Task object se response schema banao.
    Assigned user ka naam bhi add karo agar assigned hai.
    """
    response = schemas.TaskResponse.from_orm(task)

    # Assigned user ka naam dhundo
    if task.assigned_to:
        user = db.query(models.User).filter(
            models.User.id == task.assigned_to
        ).first()
        response.assigned_to_name = user.name if user else None

    return response
