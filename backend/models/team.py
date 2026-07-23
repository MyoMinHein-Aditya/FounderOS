from sqlalchemy import Column, Integer, String, DateTime
from database.base import Base
from datetime import datetime

class Team(Base):
    __tablename__ = "teams"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    owner_id = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
