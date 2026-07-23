from sqlalchemy import Column, Integer, String, DateTime
from database.base import Base
from datetime import datetime

class CalendarEvent(Base):
    __tablename__ = "calendar_events"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    startup_id = Column(Integer)
    title = Column(String)
    description = Column(String, nullable=True)
    date = Column(String)  # ISO Date String or simple date
    created_at = Column(DateTime, default=datetime.utcnow)
