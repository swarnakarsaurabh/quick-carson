# auth.py
# JWT (JSON Web Token) authentication ka logic yahan hai
# JWT ek secure way hai user ko identify karne ka bina har baar password pooche

from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt               # JWT create aur verify karne ke liye
from passlib.context import CryptContext     # Password hashing ke liye
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

import models
from database import get_db

# ─────────────────────────────────────────
#  Configuration
# ─────────────────────────────────────────

# SECRET_KEY: JWT token sign karne ke liye - production mein env variable use karo
SECRET_KEY = "taskflow-super-secret-key-change-in-production-2024"
ALGORITHM = "HS256"                    # Hashing algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # Token 24 ghante mein expire hoga

# Password hashing context - bcrypt ek strong hashing algorithm hai
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme - ye batata hai ki token kahan se aayega (Authorization header)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


# ─────────────────────────────────────────
#  Password Functions
# ─────────────────────────────────────────

def hash_password(password: str) -> str:
    """Plain text password ko hash karo - kabhi bhi plain password store mat karo"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Login ke waqt entered password ko stored hash se verify karo"""
    return pwd_context.verify(plain_password, hashed_password)


# ─────────────────────────────────────────
#  JWT Token Functions
# ─────────────────────────────────────────

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    JWT token banao.
    data: usually {"sub": user_email} - user ki identity
    expires_delta: kitni der mein token expire hoga
    """
    to_encode = data.copy()
    
    # Token expiry time calculate karo
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})  # expiry token mein add karo
    
    # Token encode karo with secret key
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> models.User:
    """
    Har protected route mein ye function call hoga.
    Token verify karega aur current logged-in user return karega.
    Agar token invalid hai toh 401 Unauthorized error milega.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Token decode karo
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")  # "sub" mein user email store ki thi
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # Database se user dhundo
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    
    return user


def get_admin_user(current_user: models.User = Depends(get_current_user)) -> models.User:
    """
    Sirf admin users ke liye protected routes.
    Agar user admin nahi hai toh 403 Forbidden milega.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user
