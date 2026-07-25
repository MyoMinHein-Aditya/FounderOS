from sqlalchemy import Column, Integer, String, DateTime
from database.base import Base
from datetime import datetime

class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    startup_id = Column(Integer)
    type = Column(String)  # PRD, Pitch Deck, Canvas, Vision
    content = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
