# database.py
# Yahan pe SQLite database ka connection setup hota hai
# SQLAlchemy ek popular ORM (Object Relational Mapper) hai Python mein
# ORM matlab: Python classes ko database tables ki tarah use kar sakte hain

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLite database file ka path - ye file locally create hogi
# "sqlite:///./taskflow.db" matlab current folder mein taskflow.db file
DATABASE_URL = "sqlite:///./taskflow.db"

# Engine banao - ye actual database connection handle karta hai
# connect_args sirf SQLite ke liye zaroori hai (multi-threading ke liye)
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# SessionLocal: har API request ke liye ek naya database session milega
# autocommit=False matlab hume manually .commit() karna hoga
# autoflush=False matlab changes tabhi DB mein jayenge jab hum flush/commit karein
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class - saare database models isse inherit karenge
Base = declarative_base()


def get_db():
    """
    Dependency function jo har API request mein database session provide karti hai.
    FastAPI mein 'Dependency Injection' pattern use hota hai.
    
    'yield' se session open hota hai → API kaam karta hai → finally mein session band hota hai
    """
    db = SessionLocal()
    try:
        yield db  # ye session API route function ko milta hai
    finally:
        db.close()  # request khatam hone ke baad session close kar do
