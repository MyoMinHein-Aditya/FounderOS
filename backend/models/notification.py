from sqlalchemy import Column, Integer, String, DateTime, Boolean
from database.base import Base
from datetime import datetime

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    message = Column(String)
    link = Column(String, nullable=True)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
