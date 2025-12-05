from sqlalchemy import create_engine, Column, Integer, String, JSON, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime

DATABASE_URL = "sqlite:///./voiceshield.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class Voice(Base):
    __tablename__ = "voices"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    fingerprint = Column(JSON) # Storing list of floats as JSON
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AnalysisLog(Base):
    __tablename__ = "analysis_logs"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    result = Column(JSON)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
