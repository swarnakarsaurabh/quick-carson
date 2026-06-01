# models.py
# Yahan pe database ke tables define hote hain Python classes ki form mein
# Har class ek database table represent karti hai

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from database import Base


# Task ki priority ke liye Enum (fixed values)
class PriorityEnum(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"


# Task ke status ke liye Enum
class StatusEnum(str, enum.Enum):
    todo = "todo"
    in_progress = "in_progress"
    done = "done"


class User(Base):
    """
    User table - saare registered users yahan store hote hain
    """
    __tablename__ = "users"  # database mein table ka naam

    id = Column(Integer, primary_key=True, index=True)  # unique ID, auto-increment
    name = Column(String, nullable=False)                # user ka naam
    email = Column(String, unique=True, index=True, nullable=False)  # unique email
    hashed_password = Column(String, nullable=False)     # password KABHI plain text mein mat store karo!
    is_active = Column(Boolean, default=True)            # account active hai ya nahi
    role = Column(String, default="member")              # "admin" ya "member"
    
    # created_at automatically current time set ho jaata hai
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship: ek user ke multiple tasks ho sakte hain
    # back_populates se Task model mein bhi User access kar sakte hain
    tasks = relationship("Task", back_populates="assigned_to_user")
    projects = relationship("Project", back_populates="owner")


class Project(Base):
    """
    Project table - har project yahan store hota hai
    """
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Foreign Key: ye project kiske dwara banaya gaya - User ki ID reference karta hai
    owner_id = Column(Integer, ForeignKey("users.id"))

    # Relationships
    owner = relationship("User", back_populates="projects")
    tasks = relationship("Task", back_populates="project", cascade="all, delete")
    # cascade="all, delete" matlab project delete hone par uske saare tasks bhi delete ho jayenge


class Task(Base):
    """
    Task table - saare tasks yahan store hote hain
    """
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    
    # Enum columns - sirf defined values hi store ho sakti hain
    status = Column(Enum(StatusEnum), default=StatusEnum.todo)
    priority = Column(Enum(PriorityEnum), default=PriorityEnum.medium)
    
    due_date = Column(String, nullable=True)  # "YYYY-MM-DD" format mein store karenge
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Foreign Keys - ye task kaunse project ka hai aur kisko assign hai
    project_id = Column(Integer, ForeignKey("projects.id"))
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Relationships
    project = relationship("Project", back_populates="tasks")
    assigned_to_user = relationship("User", back_populates="tasks")
