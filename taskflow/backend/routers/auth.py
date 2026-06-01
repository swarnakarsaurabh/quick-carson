# routers/auth.py
# User registration aur login ke API endpoints

from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import models
import schemas
from auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from database import get_db

# APIRouter ek mini-app jaisi cheez hai - related routes group karne ke liye
router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=schemas.UserResponse, status_code=201)
def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Naya user register karo.
    - Email already exist karta hai toh 400 error milega
    - Password hash karke store hoga (plain text nahi)
    """
    # Check: kya email already registered hai?
    existing_user = db.query(models.User).filter(
        models.User.email == user_data.email
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Naya user object banao
    new_user = models.User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hash_password(user_data.password),  # password hash karo!
        role=user_data.role
    )
    
    db.add(new_user)       # database mein add karo
    db.commit()            # changes save karo
    db.refresh(new_user)   # naya ID aur timestamps lao
    
    return new_user


@router.post("/login", response_model=schemas.Token)
def login(user_data: schemas.UserLogin, db: Session = Depends(get_db)):
    """
    User login karo aur JWT token return karo.
    Frontend is token ko localStorage mein save karega aur
    har API call mein 'Authorization: Bearer <token>' header bhejega.
    """
    # Email se user dhundo
    user = db.query(models.User).filter(
        models.User.email == user_data.email
    ).first()
    
    # User nahi mila ya password galat hai - dono ke liye same error
    # (security reason: attacker ko ye nahi batana ki email exist karta hai ya nahi)
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is deactivated"
        )
    
    # JWT token banao
    token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email},  # "sub" = subject (user ki identity)
        expires_delta=token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    """
    Currently logged-in user ki info return karo.
    Frontend page refresh ke baad is endpoint se user info leta hai.
    """
    return current_user
