from sqlalchemy import Column, Integer, String, DateTime
from database.base import Base
from datetime import datetime

class AIMessage(Base):
    __tablename__ = "ai_messages"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    role = Column(String)
    content = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
