# routers/projects.py
# Projects ke CRUD (Create, Read, Update, Delete) endpoints

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

import models
import schemas
from auth import get_current_user
from database import get_db

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.post("/", response_model=schemas.ProjectResponse, status_code=201)
def create_project(
    project_data: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)  # login required!
):
    """
    Naya project banao.
    Owner automatically logged-in user hoga.
    """
    new_project = models.Project(
        name=project_data.name,
        description=project_data.description,
        owner_id=current_user.id  # current user = owner
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    
    # task_count add karo response mein
    result = schemas.ProjectResponse.from_orm(new_project)
    result.task_count = 0
    return result


@router.get("/", response_model=List[schemas.ProjectResponse])
def get_all_projects(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Saare active projects lao.
    Har project ke saath uske tasks ki count bhi bhejo.
    """
    projects = db.query(models.Project).filter(
        models.Project.is_active == True
    ).all()
    
    result = []
    for project in projects:
        # Har project ke tasks count karo
        task_count = db.query(models.Task).filter(
            models.Task.project_id == project.id
        ).count()
        
        proj_response = schemas.ProjectResponse.from_orm(project)
        proj_response.task_count = task_count
        result.append(proj_response)
    
    return result


@router.get("/{project_id}", response_model=schemas.ProjectResponse)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Ek specific project ki details lao"""
    project = db.query(models.Project).filter(
        models.Project.id == project_id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    task_count = db.query(models.Task).filter(
        models.Task.project_id == project_id
    ).count()
    
    result = schemas.ProjectResponse.from_orm(project)
    result.task_count = task_count
    return result


@router.put("/{project_id}", response_model=schemas.ProjectResponse)
def update_project(
    project_id: int,
    project_data: schemas.ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Project update karo.
    Sirf owner ya admin hi update kar sakta hai.
    """
    project = db.query(models.Project).filter(
        models.Project.id == project_id
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Permission check: sirf owner ya admin update kar sakta hai
    if project.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this project"
        )
    
    # Sirf whi fields update karo jo bheje gaye hain (None nahi hain)
    update_data = project_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)
    
    db.commit()
    db.refresh(project)
    
    task_count = db.query(models.Task).filter(
        models.Task.project_id == project_id
    ).count()
    result = schemas.ProjectResponse.from_orm(project)
    result.task_count = task_count
    return result


@router.delete("/{project_id}", status_code=204)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Project delete karo (cascade: saare tasks bhi delete ho jayenge).
    Sirf owner ya admin delete kar sakta hai.
    """
    project = db.query(models.Project).filter(
        models.Project.id == project_id
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db.delete(project)
    db.commit()
    return None
