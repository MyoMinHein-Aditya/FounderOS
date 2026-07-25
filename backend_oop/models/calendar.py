from sqlalchemy import Column, Integer, String
from models.base import Base

class CalendarEvent(Base):
    __tablename__ = "calendar_events"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
