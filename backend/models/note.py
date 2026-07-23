from sqlalchemy import Column, Integer, String, DateTime, Boolean
from database.base import Base
from datetime import datetime

class Note(Base):
    __tablename__ = "notes"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    startup_id = Column(Integer)
    title = Column(String)
    content = Column(String)
    tags = Column(String)
    is_pinned = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
